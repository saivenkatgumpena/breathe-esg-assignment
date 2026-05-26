import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.companies.models import Company, UserProfile
from apps.records.models import UnitConversion

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

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
