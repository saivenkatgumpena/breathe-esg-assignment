import os
from datetime import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.companies.models import Company, UserProfile
from apps.records.models import DataSource, ESGRecord, UnitConversion

class Command(BaseCommand):
    help = 'Seeds the database with default companies, users, and unit conversion rates.'

    def handle(self, *args, **options):
        self.stdout.write("Seeding data...")

        # 1. Create Default Company
        company, created = Company.objects.get_or_create(name="Breathe ESG Corp")
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created company: {company.name}"))
        else:
            self.stdout.write(f"Company {company.name} already exists.")

        # 2. Create User
        username = "analyst"
        email = "analyst@breatheesg.com"
        password = "password123"

        user, user_created = User.objects.get_or_create(username=username, defaults={'email': email})
        if user_created:
            user.set_password(password)
            user.is_staff = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created user: {username}"))
        else:
            self.stdout.write(f"User {username} already exists.")

        # Associate User with Company via UserProfile
        profile, profile_created = UserProfile.objects.get_or_create(user=user, company=company)
        if profile_created:
            self.stdout.write(self.style.SUCCESS(f"Created UserProfile associating {username} with {company.name}"))

        # 3. Create Unit Conversions
        conversions = [
            # Litres
            ('L', 'litres', 1.0000),
            ('l', 'litres', 1.0000),
            ('liter', 'litres', 1.0000),
            ('liters', 'litres', 1.0000),
            ('litres', 'litres', 1.0000),
            # Kilograms / Tons
            ('Ton', 'kg', 1000.0000),
            ('Tons', 'kg', 1000.0000),
            ('ton', 'kg', 1000.0000),
            ('tons', 'kg', 1000.0000),
            ('kg', 'kg', 1.0000),
            ('KG', 'kg', 1.0000),
            ('kilogram', 'kg', 1.0000),
            ('kilograms', 'kg', 1.0000),
            # kWh / MWh
            ('kWh', 'kWh', 1.0000),
            ('kwh', 'kWh', 1.0000),
            ('KWH', 'kWh', 1.0000),
            ('MWh', 'kWh', 1000.0000),
            ('mwh', 'kWh', 1000.0000),
            # Travel units
            ('trip', 'trip', 1.0000),
            ('km', 'km', 1.0000),
        ]

        for src, dest, mult in conversions:
            uc, uc_created = UnitConversion.objects.get_or_create(
                source_unit=src,
                normalized_unit=dest,
                defaults={'multiplier': mult}
            )
            if uc_created:
                self.stdout.write(f"Created unit conversion: {src} -> {dest} (*{mult})")

        # 4. Seed default ESG Records
        self.stdout.write("Checking/seeding default ESG records...")
        
        # Create default sources
        sap_ds, _ = DataSource.objects.get_or_create(
            company=company,
            source_type='SAP',
            file_name='default_sap_seed.csv',
            defaults={'uploaded_by': user}
        )
        utility_ds, _ = DataSource.objects.get_or_create(
            company=company,
            source_type='UTILITY',
            file_name='default_utility_seed.csv',
            defaults={'uploaded_by': user}
        )
        travel_ds, _ = DataSource.objects.get_or_create(
            company=company,
            source_type='TRAVEL',
            file_name='default_travel_seed.json',
            defaults={'uploaded_by': user}
        )

        records_to_seed = [
            # SAP
            {
                'source': sap_ds,
                'category': 'Diesel',
                'scope': 'Scope 1',
                'quantity': 1500.0000,
                'normalized_unit': 'litres',
                'activity_date': '2026-05-10',
                'status': 'APPROVED',
                'notes': 'Verified monthly fuel invoice'
            },
            {
                'source': sap_ds,
                'category': 'Petrol',
                'scope': 'Scope 1',
                'quantity': 350.0000,
                'normalized_unit': 'litres',
                'activity_date': '2026-05-12',
                'status': 'PENDING',
                'notes': ''
            },
            {
                'source': sap_ds,
                'category': 'Procurement: Steel Rebar',
                'scope': 'Scope 3',
                'quantity': 5000.0000,
                'normalized_unit': 'kg',
                'activity_date': '2026-05-14',
                'status': 'PENDING',
                'notes': ''
            },
            {
                'source': sap_ds,
                'category': 'Procurement: Concrete',
                'scope': 'Scope 3',
                'quantity': 8500.0000,
                'normalized_unit': 'kg',
                'activity_date': '2026-05-15',
                'status': 'SUSPICIOUS',
                'notes': 'High bulk delivery volume'
            },
            {
                'source': sap_ds,
                'category': 'Coal',
                'scope': 'Scope 1',
                'quantity': 12000.0000,
                'normalized_unit': 'kg',
                'activity_date': '2026-05-16',
                'status': 'LOCKED',
                'notes': 'Locked for annual compliance reporting'
            },
            # Utility
            {
                'source': utility_ds,
                'category': 'Electricity (Meter: M001)',
                'scope': 'Scope 2',
                'quantity': 4500.0000,
                'normalized_unit': 'kWh',
                'activity_date': '2026-05-10',
                'status': 'APPROVED',
                'notes': 'Corporate office meter'
            },
            {
                'source': utility_ds,
                'category': 'Electricity (Meter: M002)',
                'scope': 'Scope 2',
                'quantity': 1200.0000,
                'normalized_unit': 'kWh',
                'activity_date': '2026-05-12',
                'status': 'PENDING',
                'notes': ''
            },
            {
                'source': utility_ds,
                'category': 'Electricity (Meter: M003)',
                'scope': 'Scope 2',
                'quantity': 58000.0000,
                'normalized_unit': 'kWh',
                'activity_date': '2026-05-15',
                'status': 'SUSPICIOUS',
                'notes': 'High consumption: 58000 kWh'
            },
            {
                'source': utility_ds,
                'category': 'Electricity (Meter: M001)',
                'scope': 'Scope 2',
                'quantity': 3200.0000,
                'normalized_unit': 'kWh',
                'activity_date': '2026-04-10',
                'status': 'LOCKED',
                'notes': 'Q1 electricity audit locked'
            },
            # Travel
            {
                'source': travel_ds,
                'category': 'Travel (flight) HYD -> DEL by Sai',
                'scope': 'Scope 3',
                'quantity': 1.0000,
                'normalized_unit': 'trip',
                'activity_date': '2026-05-10',
                'status': 'APPROVED',
                'notes': 'Client onsite flight'
            },
            {
                'source': travel_ds,
                'category': 'Travel (taxi) Office -> Airport by Venkat',
                'scope': 'Scope 3',
                'quantity': 15.0000,
                'normalized_unit': 'km',
                'activity_date': '2026-05-12',
                'status': 'PENDING',
                'notes': ''
            },
            {
                'source': travel_ds,
                'category': "Travel (flight) BOM -> BOM by Nihar",
                'scope': 'Scope 3',
                'quantity': 1.0000,
                'normalized_unit': 'trip',
                'activity_date': '2026-05-14',
                'status': 'SUSPICIOUS',
                'notes': "Identical departure and destination: 'BOM'"
            },
            {
                'source': travel_ds,
                'category': 'Travel (hotel) Delhi Stay by Rahul',
                'scope': 'Scope 3',
                'quantity': 3.0000,
                'normalized_unit': 'trip',
                'activity_date': '2026-05-16',
                'status': 'LOCKED',
                'notes': 'Conference lodging expense'
            },
            # Additional SAP records
            {
                'source': sap_ds,
                'category': 'Natural Gas',
                'scope': 'Scope 1',
                'quantity': 850.0000,
                'normalized_unit': 'kg',
                'activity_date': '2026-05-18',
                'status': 'PENDING',
                'notes': ''
            },
            {
                'source': sap_ds,
                'category': 'Heavy Fuel Oil',
                'scope': 'Scope 1',
                'quantity': 3200.0000,
                'normalized_unit': 'litres',
                'activity_date': '2026-05-20',
                'status': 'PENDING',
                'notes': ''
            },
            {
                'source': sap_ds,
                'category': 'Generator Diesel',
                'scope': 'Scope 1',
                'quantity': 680.0000,
                'normalized_unit': 'litres',
                'activity_date': '2026-05-22',
                'status': 'APPROVED',
                'notes': 'Off-grid standby power consumption'
            },
            {
                'source': sap_ds,
                'category': 'Procurement: Raw Aluminum',
                'scope': 'Scope 3',
                'quantity': 15000.0000,
                'normalized_unit': 'kg',
                'activity_date': '2026-05-18',
                'status': 'APPROVED',
                'notes': 'Annual metal framing procurement batch'
            },
            {
                'source': sap_ds,
                'category': 'Procurement: Copper Wire',
                'scope': 'Scope 3',
                'quantity': 2500.0000,
                'normalized_unit': 'kg',
                'activity_date': '2026-05-20',
                'status': 'PENDING',
                'notes': ''
            },
            # Additional Utility records
            {
                'source': utility_ds,
                'category': 'Electricity (Meter: M004)',
                'scope': 'Scope 2',
                'quantity': 9500.0000,
                'normalized_unit': 'kWh',
                'activity_date': '2026-05-18',
                'status': 'APPROVED',
                'notes': 'Data center sub-meter'
            },
            {
                'source': utility_ds,
                'category': 'Electricity (Meter: M005)',
                'scope': 'Scope 2',
                'quantity': 450.0000,
                'normalized_unit': 'kWh',
                'activity_date': '2026-05-20',
                'status': 'FAILED',
                'notes': 'Tariff code mismatch'
            },
            {
                'source': utility_ds,
                'category': 'Electricity (Meter: M002)',
                'scope': 'Scope 2',
                'quantity': 2800.0000,
                'normalized_unit': 'kWh',
                'activity_date': '2026-04-12',
                'status': 'LOCKED',
                'notes': 'Audited utility reporting'
            },
            # Additional Travel records
            {
                'source': travel_ds,
                'category': 'Travel (flight) BLR -> HYD by Shivang',
                'scope': 'Scope 3',
                'quantity': 1.0000,
                'normalized_unit': 'trip',
                'activity_date': '2026-05-18',
                'status': 'APPROVED',
                'notes': 'Regional review presentation'
            },
            {
                'source': travel_ds,
                'category': 'Travel (taxi) Hotel -> Airport by Rahul',
                'scope': 'Scope 3',
                'quantity': 45.0000,
                'normalized_unit': 'km',
                'activity_date': '2026-05-20',
                'status': 'PENDING',
                'notes': ''
            },
            {
                'source': travel_ds,
                'category': 'Travel (flight) DEL -> JFK by Saurav',
                'scope': 'Scope 3',
                'quantity': 12000.0000,
                'normalized_unit': 'km',
                'activity_date': '2026-05-21',
                'status': 'SUSPICIOUS',
                'notes': 'Unusually high travel distance: 12000 km'
            },
            {
                'source': travel_ds,
                'category': 'Travel (hotel) Mumbai Stay by Rahul',
                'scope': 'Scope 3',
                'quantity': 5.0000,
                'normalized_unit': 'trip',
                'activity_date': '2026-05-22',
                'status': 'APPROVED',
                'notes': 'Onsite audit preparation'
            }
        ]

        seeded_count = 0
        for r in records_to_seed:
            act_date = datetime.strptime(r['activity_date'], '%Y-%m-%d').date() if r['activity_date'] else None
            exists = ESGRecord.objects.filter(
                company=company,
                category=r['category'],
                scope=r['scope'],
                quantity=r['quantity'],
                normalized_unit=r['normalized_unit'],
                activity_date=act_date
            ).exists()

            if not exists:
                ESGRecord.objects.create(
                    company=company,
                    source=r['source'],
                    category=r['category'],
                    scope=r['scope'],
                    quantity=r['quantity'],
                    normalized_unit=r['normalized_unit'],
                    activity_date=act_date,
                    status=r['status'],
                    notes=r['notes'],
                    raw_data={'seeded': True}
                )
                seeded_count += 1

        if seeded_count > 0:
            self.stdout.write(self.style.SUCCESS(f"Seeded {seeded_count} new default ESG records successfully."))
        else:
            self.stdout.write("All default records already exist in the database.")

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
