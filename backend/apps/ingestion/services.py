import csv
import json
import decimal
from datetime import datetime
from apps.records.models import ESGRecord, UnitConversion

def parse_date(date_str):
    if not date_str or not isinstance(date_str, str):
        return None
    date_str = date_str.strip()
    for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d.%m.%Y'):
        try:
            return datetime.strptime(date_str, fmt).date()
        except ValueError:
            continue
    return None

def normalize_quantity_and_unit(qty_str, unit_str):
    """
    Returns (normalized_qty, normalized_unit, error_message)
    """
    if qty_str is None:
        return None, "", "Missing quantity value"
    
    try:
        qty = decimal.Decimal(str(qty_str).strip())
    except (ValueError, decimal.InvalidOperation):
        return None, "", f"Invalid numeric quantity: '{qty_str}'"

    if qty < 0:
        return qty, "", "Quantity cannot be negative"

    unit_str = (unit_str or "").strip()
    if not unit_str:
        return qty, "", "Missing unit value"

    # Lookup unit conversion
    try:
        conv = UnitConversion.objects.get(source_unit=unit_str)
        normalized_qty = qty * conv.multiplier
        return normalized_qty, conv.normalized_unit, None
    except UnitConversion.DoesNotExist:
        # Check case-insensitive
        try:
            conv = UnitConversion.objects.get(source_unit__iexact=unit_str)
            normalized_qty = qty * conv.multiplier
            return normalized_qty, conv.normalized_unit, None
        except UnitConversion.DoesNotExist:
            # Fallback: keep quantity and unit as is, return error message
            return qty, unit_str, f"Unknown unit: '{unit_str}'"

def process_sap_csv(file_content, data_source, company):
    """
    Expects CSV header: PlantCode,Material,Fuel_Type,Quantity,Unit,Date
    """
    decoded_file = file_content.decode('utf-8').splitlines()
    reader = csv.DictReader(decoded_file)
    
    summary = {
        'total': 0,
        'imported': 0,
        'failed': 0,
        'suspicious': 0
    }
    
    for row in reader:
        summary['total'] += 1
        
        plant_code = row.get('PlantCode', '').strip()
        material = row.get('Material', '').strip()
        fuel_type = row.get('Fuel_Type', '').strip()
        qty_str = row.get('Quantity', None)
        unit_str = row.get('Unit', '').strip()
        date_str = row.get('Date', '').strip()

        # Parse date
        activity_date = parse_date(date_str)
        
        # Ingestion failure checks
        errors = []
        if not activity_date:
            errors.append(f"Invalid or missing date: '{date_str}'")
        if not material and not fuel_type:
            errors.append("Both Material and Fuel_Type are missing")

        norm_qty, norm_unit, qty_err = normalize_quantity_and_unit(qty_str, unit_str)
        if qty_err:
            errors.append(qty_err)

        if errors:
            # Create failed ESGRecord
            ESGRecord.objects.create(
                company=company,
                source=data_source,
                category=fuel_type or material or "SAP Ingestion",
                scope="Scope 1" if fuel_type else "Scope 3",
                quantity=None,
                normalized_unit=unit_str,
                activity_date=activity_date,
                status='FAILED',
                notes="; ".join(errors),
                raw_data=dict(row)
            )
            summary['failed'] += 1
            continue

        # Ingestion succeeded, check for suspicious values
        # SAP Fuel (Diesel, Petrol, Coal, Gas, LPG, etc.) is Scope 1
        # SAP Procurement is Scope 3
        is_fuel = fuel_type.lower() in ('diesel', 'petrol', 'coal', 'gas', 'lpg', 'fuel oil', 'generator diesel')
        scope = "Scope 1" if is_fuel else "Scope 3"
        category = fuel_type if is_fuel else f"Procurement: {material}"

        status = 'PENDING'
        notes = ''

        # Suspicious rules
        suspicious_reasons = []
        # Quantity threshold: e.g., quantity > 10,000 litres/kg
        if norm_qty > 10000:
            suspicious_reasons.append(f"High quantity: {norm_qty} {norm_unit}")
        # Plant code check (e.g. empty plant code)
        if not plant_code:
            suspicious_reasons.append("Missing Plant Code")

        if suspicious_reasons:
            status = 'SUSPICIOUS'
            notes = "; ".join(suspicious_reasons)
            summary['suspicious'] += 1
        else:
            summary['imported'] += 1

        ESGRecord.objects.create(
            company=company,
            source=data_source,
            category=category,
            scope=scope,
            quantity=norm_qty,
            normalized_unit=norm_unit,
            activity_date=activity_date,
            status=status,
            notes=notes,
            raw_data=dict(row)
        )

    return summary

def process_utility_csv(file_content, data_source, company):
    """
    Expects CSV header: Meter_ID,Consumption_kWh,Billing_Start,Billing_End,Tariff
    """
    decoded_file = file_content.decode('utf-8').splitlines()
    reader = csv.DictReader(decoded_file)
    
    summary = {
        'total': 0,
        'imported': 0,
        'failed': 0,
        'suspicious': 0
    }
    
    for row in reader:
        summary['total'] += 1
        
        meter_id = row.get('Meter_ID', '').strip()
        consumption_str = row.get('Consumption_kWh', None)
        billing_start_str = row.get('Billing_Start', '').strip()
        billing_end_str = row.get('Billing_End', '').strip()
        tariff = row.get('Tariff', '').strip()

        # Parse billing period
        start_date = parse_date(billing_start_str)
        end_date = parse_date(billing_end_str)

        errors = []
        if not start_date:
            errors.append(f"Invalid/missing Billing_Start: '{billing_start_str}'")
        if not end_date:
            errors.append(f"Invalid/missing Billing_End: '{billing_end_str}'")
        if start_date and end_date and start_date > end_date:
            errors.append(f"Billing_Start ({billing_start_str}) occurs after Billing_End ({billing_end_str})")

        # Utility bills are standard electricity data -> consumption_kWh (unit kWh)
        norm_qty, norm_unit, qty_err = normalize_quantity_and_unit(consumption_str, 'kWh')
        if qty_err:
            errors.append(qty_err)

        if errors:
            # Create failed ESGRecord
            ESGRecord.objects.create(
                company=company,
                source=data_source,
                category="Electricity",
                scope="Scope 2",
                quantity=None,
                normalized_unit="kWh",
                activity_date=start_date, # Fallback
                status='FAILED',
                notes="; ".join(errors),
                raw_data=dict(row)
            )
            summary['failed'] += 1
            continue

        # Suspicious checks
        status = 'PENDING'
        notes = ''
        suspicious_reasons = []

        # Check billing duration (billing periods not matching standard 28-33 day cycle)
        billing_days = (end_date - start_date).days
        if billing_days > 45 or billing_days < 15:
            suspicious_reasons.append(f"Atypical billing period: {billing_days} days")
        # Consumption > 50,000 kWh
        if norm_qty > 50000:
            suspicious_reasons.append(f"High consumption: {norm_qty} kWh")
        # Meter ID missing
        if not meter_id:
            suspicious_reasons.append("Missing Meter ID")

        if suspicious_reasons:
            status = 'SUSPICIOUS'
            notes = "; ".join(suspicious_reasons)
            summary['suspicious'] += 1
        else:
            summary['imported'] += 1

        ESGRecord.objects.create(
            company=company,
            source=data_source,
            category=f"Electricity (Meter: {meter_id})",
            scope="Scope 2",
            quantity=norm_qty,
            normalized_unit=norm_unit,
            activity_date=end_date, # Standard practice uses end date or mid point
            status=status,
            notes=notes,
            raw_data=dict(row)
        )

    return summary

def process_travel_json(file_content, data_source, company):
    """
    Expects JSON array of objects:
    [
        {"employee": "Sai", "type": "flight", "from": "HYD", "to": "DEL", "quantity": 1, "unit": "trip", "date": "2026-05-01"}
    ]
    """
    try:
        data = json.loads(file_content.decode('utf-8'))
    except json.JSONDecodeError as e:
        return {'total': 0, 'imported': 0, 'failed': 1, 'suspicious': 0, 'error': f"Invalid JSON format: {str(e)}"}

    if not isinstance(data, list):
        # Convert single object to list
        data = [data]

    summary = {
        'total': 0,
        'imported': 0,
        'failed': 0,
        'suspicious': 0
    }

    for index, row in enumerate(data):
        summary['total'] += 1
        
        employee = row.get('employee', '').strip()
        travel_type = row.get('type', '').strip()  # flight, hotel, taxi
        from_loc = row.get('from', '').strip()
        to_loc = row.get('to', '').strip()
        qty = row.get('quantity', 1)  # Default to 1 if not provided
        unit = row.get('unit', 'trip').strip()  # Default to 'trip'
        date_str = row.get('date', datetime.today().strftime('%Y-%m-%d')).strip()

        activity_date = parse_date(date_str)

        errors = []
        if not activity_date:
            errors.append(f"Invalid/missing date: '{date_str}'")
        if not travel_type:
            errors.append("Missing travel type (e.g. flight, hotel, taxi)")
        
        norm_qty, norm_unit, qty_err = normalize_quantity_and_unit(qty, unit)
        if qty_err:
            errors.append(qty_err)

        # Corporate travel platforms default to Scope 3
        scope = "Scope 3"

        if errors:
            ESGRecord.objects.create(
                company=company,
                source=data_source,
                category=travel_type or "Travel Ingestion",
                scope=scope,
                quantity=None,
                normalized_unit=unit,
                activity_date=activity_date or datetime.today().date(),
                status='FAILED',
                notes="; ".join(errors),
                raw_data=row
            )
            summary['failed'] += 1
            continue

        status = 'PENDING'
        notes = ''
        suspicious_reasons = []

        # Suspicious rules
        if from_loc and to_loc and from_loc.lower() == to_loc.lower():
            suspicious_reasons.append(f"Identical departure and destination: '{from_loc}'")
        if travel_type.lower() == 'flight' and (not from_loc or not to_loc):
            suspicious_reasons.append("Missing flight departure/destination")
        # Distance-based units (km, miles) have much higher thresholds than trip-based
        distance_units = ('km', 'miles', 'mi', 'kilometer', 'kilometers')
        if norm_unit.lower() in distance_units:
            if norm_qty > 500:
                suspicious_reasons.append(f"Unusually high travel distance: {norm_qty} {norm_unit}")
        else:
            # Trip-based (flights, hotels, etc.)
            if norm_qty > 10:
                suspicious_reasons.append(f"Unusually high quantity of travel units: {norm_qty} {norm_unit}")

        if suspicious_reasons:
            status = 'SUSPICIOUS'
            notes = "; ".join(suspicious_reasons)
            summary['suspicious'] += 1
        else:
            summary['imported'] += 1

        category = f"Travel ({travel_type})"
        if from_loc and to_loc:
            category += f" {from_loc} -> {to_loc}"
        if employee:
            category += f" by {employee}"

        ESGRecord.objects.create(
            company=company,
            source=data_source,
            category=category,
            scope=scope,
            quantity=norm_qty,
            normalized_unit=norm_unit,
            activity_date=activity_date,
            status=status,
            notes=notes,
            raw_data=row
        )

    return summary
