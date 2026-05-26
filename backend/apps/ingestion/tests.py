import decimal
import json
from django.test import TestCase
from django.contrib.auth.models import User
from apps.companies.models import Company
from apps.records.models import DataSource, ESGRecord, UnitConversion
from apps.ingestion.services import parse_date, normalize_quantity_and_unit, process_sap_csv, process_utility_csv, process_travel_json

class IngestionServicesTestCase(TestCase):
    def setUp(self):
        # Create company
        self.company = Company.objects.create(name="Breathe ESG Corp")
        # Create user
        self.user = User.objects.create_user(username="test_analyst", password="password")
        
        # Seed unit conversions
        UnitConversion.objects.create(source_unit="L", normalized_unit="litres", multiplier=1.0)
        UnitConversion.objects.create(source_unit="Ton", normalized_unit="kg", multiplier=1000.0)
        UnitConversion.objects.create(source_unit="kWh", normalized_unit="kWh", multiplier=1.0)
        UnitConversion.objects.create(source_unit="trip", normalized_unit="trip", multiplier=1.0)

    def test_parse_date(self):
        self.assertEqual(str(parse_date("2026-05-01")), "2026-05-01")
        self.assertEqual(str(parse_date("01/05/2026")), "2026-05-01")
        self.assertEqual(str(parse_date("05/01/2026")), "2026-01-05") # tries d/m/Y then m/d/Y
        self.assertEqual(str(parse_date("01.05.2026")), "2026-05-01")
        self.assertIsNone(parse_date("invalid-date"))
        self.assertIsNone(parse_date(""))

    def test_normalize_quantity_and_unit(self):
        # Normal path
        qty, unit, err = normalize_quantity_and_unit("500", "L")
        self.assertEqual(qty, decimal.Decimal("500"))
        self.assertEqual(unit, "litres")
        self.assertIsNone(err)

        # Multiplier conversion path
        qty, unit, err = normalize_quantity_and_unit("2.5", "Ton")
        self.assertEqual(qty, decimal.Decimal("2500.0"))
        self.assertEqual(unit, "kg")
        self.assertIsNone(err)

        # Unknown unit path
        qty, unit, err = normalize_quantity_and_unit("10", "Gallons")
        self.assertEqual(qty, decimal.Decimal("10"))
        self.assertEqual(unit, "Gallons")
        self.assertEqual(err, "Unknown unit: 'Gallons'")

        # Negative quantity
        qty, unit, err = normalize_quantity_and_unit("-50", "L")
        self.assertEqual(err, "Quantity cannot be negative")

        # Invalid numeric quantity
        qty, unit, err = normalize_quantity_and_unit("abc", "L")
        self.assertEqual(err, "Invalid numeric quantity: 'abc'")

    def test_process_sap_csv(self):
        # Set up datasource
        ds = DataSource.objects.create(
            company=self.company,
            source_type='SAP',
            file_name='sap_test.csv',
            uploaded_by=self.user
        )

        csv_content = (
            "PlantCode,Material,Fuel_Type,Quantity,Unit,Date\n"
            "PL001,Generator Diesel,Diesel,500,L,2026-05-01\n"  # Valid Scope 1
            "PL002,Steel Rebar,,50,Ton,2026-05-02\n"          # Valid Scope 3 (quantity 50 Ton -> 50,000 kg -> suspicious (>10000))
            "PL001,Coal Purchase,Coal,-10,Ton,2026-05-03\n"     # Failed (negative qty)
            "PL003,,Diesel,12000,L,2026-05-04\n"              # Suspicious (qty > 10,000)
        ).encode('utf-8')

        summary = process_sap_csv(csv_content, ds, self.company)
        
        self.assertEqual(summary['total'], 4)
        self.assertEqual(summary['imported'], 1)  # the first one (500L)
        self.assertEqual(summary['failed'], 1)    # the negative one
        self.assertEqual(summary['suspicious'], 2)# the 50 Ton steel (>10000kg) and 12000L diesel

        # Verify created records
        records = ESGRecord.objects.filter(source=ds)
        self.assertEqual(records.count(), 4)
        
        r1 = records.get(category="Diesel", status="PENDING")
        self.assertEqual(r1.status, "PENDING")
        self.assertEqual(r1.scope, "Scope 1")
        self.assertEqual(r1.quantity, decimal.Decimal("500"))

        r2 = records.get(category="Procurement: Steel Rebar")
        self.assertEqual(r2.status, "SUSPICIOUS")
        self.assertEqual(r2.scope, "Scope 3")
        self.assertEqual(r2.quantity, decimal.Decimal("50000"))

    def test_process_utility_csv(self):
        ds = DataSource.objects.create(
            company=self.company,
            source_type='UTILITY',
            file_name='utility_test.csv',
            uploaded_by=self.user
        )

        csv_content = (
            "Meter_ID,Consumption_kWh,Billing_Start,Billing_End,Tariff\n"
            "M001,1500,2026-04-01,2026-04-30,Industrial\n"    # Valid Scope 2 (29 days)
            "M002,60000,2026-04-01,2026-04-30,Commercial\n"   # Suspicious (Consumption > 50,000)
            "M003,2000,2026-04-01,2026-06-01,Industrial\n"    # Suspicious (Billing period 61 days > 45 days)
            "M004,,2026-04-01,2026-04-30,Industrial\n"        # Failed (missing consumption)
            "M005,100,2026-04-30,2026-04-01,Industrial\n"     # Failed (Start > End)
        ).encode('utf-8')

        summary = process_utility_csv(csv_content, ds, self.company)
        
        self.assertEqual(summary['total'], 5)
        self.assertEqual(summary['imported'], 1)
        self.assertEqual(summary['failed'], 2)
        self.assertEqual(summary['suspicious'], 2)

    def test_process_travel_json(self):
        ds = DataSource.objects.create(
            company=self.company,
            source_type='TRAVEL',
            file_name='travel_test.json',
            uploaded_by=self.user
        )

        json_data = [
            {"employee": "Sai", "type": "flight", "from": "HYD", "to": "DEL", "quantity": 1, "unit": "trip", "date": "2026-05-01"}, # Valid Scope 3
            {"employee": "Nihar", "type": "flight", "from": "BOM", "to": "BOM", "quantity": 1, "unit": "trip", "date": "2026-05-02"}, # Suspicious (from == to)
            {"employee": "Venkat", "type": "", "from": "HYD", "to": "BLR", "quantity": 1, "unit": "trip", "date": "2026-05-03"}  # Failed (missing type)
        ]
        json_content = json.dumps(json_data).encode('utf-8')

        summary = process_travel_json(json_content, ds, self.company)
        
        self.assertEqual(summary['total'], 3)
        self.assertEqual(summary['imported'], 1)
        self.assertEqual(summary['suspicious'], 1)
        self.assertEqual(summary['failed'], 1)
