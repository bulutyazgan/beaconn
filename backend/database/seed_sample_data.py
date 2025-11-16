"""
Seed Sample Data for Testing
Adds 20+ helpers and callers around London
"""

import sys
import os
import random
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from database.db import get_db_cursor

# London center coordinates
LONDON_CENTER = (51.5074, -0.1278)

# Define neighborhoods around London with approximate coordinates
LONDON_AREAS = [
    ("Westminster", 51.4975, -0.1357),
    ("Camden", 51.5390, -0.1426),
    ("Islington", 51.5465, -0.1058),
    ("Hackney", 51.5450, -0.0553),
    ("Tower Hamlets", 51.5099, -0.0059),
    ("Greenwich", 51.4826, 0.0077),
    ("Lewisham", 51.4415, -0.0117),
    ("Southwark", 51.5035, -0.0804),
    ("Lambeth", 51.4607, -0.1163),
    ("Wandsworth", 51.4571, -0.1919),
    ("Hammersmith", 51.4927, -0.2339),
    ("Kensington", 51.4991, -0.1938),
    ("Brent", 51.5673, -0.2711),
    ("Ealing", 51.5130, -0.3089),
    ("Hounslow", 51.4746, -0.3680),
    ("Richmond", 51.4613, -0.3037),
    ("Kingston", 51.4123, -0.3007),
    ("Croydon", 51.3762, -0.0982),
    ("Bromley", 51.4039, 0.0198),
    ("Barnet", 51.6252, -0.2000),
]

# Helper skills options
HELPER_SKILLS = [
    ['first_aid', 'medical'],
    ['search_rescue'],
    ['medical', 'transport'],
    ['first_aid'],
    ['shelter', 'food'],
    ['medical'],
    ['search_rescue', 'first_aid'],
    ['transport'],
    ['food', 'supplies'],
    ['first_aid', 'search_rescue', 'medical'],
]

# Sample helper names
HELPER_NAMES = [
    "Dr. Sarah Johnson", "Mark Williams", "Emily Chen", "James O'Connor",
    "Aisha Patel", "David Thompson", "Maria Garcia", "Ahmed Hassan",
    "Lisa Anderson", "Michael Brown", "Fatima Ali", "John Smith",
    "Priya Sharma", "Robert Davis", "Sofia Martinez", "Thomas Wilson",
    "Amara Okafor", "Daniel Lee", "Olivia Taylor", "Mohammed Khan",
    "Grace Nguyen", "Christopher White", "Zara Ahmed", "Matthew Jones",
    "Leila Mansour", "Ryan Murphy"
]

# Sample victim/caller names
CALLER_NAMES = [
    "Emma Roberts", "Oliver Jackson", "Sophia Turner", "Harry Mitchell",
    "Ava Cooper", "Jack Richardson", "Isabella Hughes", "George Edwards",
    "Mia Collins", "Oscar Stewart", "Charlotte Morris", "Leo Rogers",
    "Amelia Bennett", "Alfie Ward", "Isla Murphy", "Noah Fisher",
    "Poppy Price", "Arthur Russell", "Evie Barnes", "Muhammad Ali",
    "Freya Khan", "William Singh", "Ella Patel", "Henry Chen",
    "Grace Lee", "Samuel Kim"
]

# Problem descriptions for victims
VICTIM_PROBLEMS = [
    "Trapped in collapsed building, 2nd floor",
    "Elderly person unable to evacuate, needs assistance",
    "Family of 4 stranded on rooftop",
    "Child separated from parents in evacuation",
    "Person with medical emergency, needs immediate help",
    "Wheelchair user unable to navigate debris",
    "Pregnant woman in labor, can't reach hospital",
    "Group of 3 trapped in basement",
    "Injured person bleeding, needs medical attention",
    "Elderly couple without food or water for 2 days",
    "Person with diabetes, out of insulin",
    "Family with infant, no shelter",
    "Asthmatic person, lost inhaler",
    "Person stuck in elevator",
    "Injured leg, cannot walk",
    "Group of 5 in unstable building",
    "Person with broken arm needs medical attention",
    "Family separated during evacuation",
    "Elderly person fallen, cannot get up",
    "Person with heart condition needs medication"
]


def add_random_offset(lat, lon, max_km=2.0):
    """Add random offset to coordinates (up to max_km in any direction)"""
    # Rough approximation: 1 degree latitude ≈ 111 km, 1 degree longitude ≈ 111 km * cos(lat)
    lat_offset = (random.random() * 2 - 1) * (max_km / 111.0)
    lon_offset = (random.random() * 2 - 1) * (max_km / (111.0 * 0.7))  # cos(51.5) ≈ 0.7
    return lat + lat_offset, lon + lon_offset


def seed_helpers(count=25):
    """Create helper users distributed around London"""
    with get_db_cursor() as cursor:
        print(f"\n🏥 Creating {count} helpers around London...")

        helper_ids = []
        for i in range(count):
            area_name, area_lat, area_lon = random.choice(LONDON_AREAS)
            lat, lon = add_random_offset(area_lat, area_lon, max_km=1.5)

            skills = random.choice(HELPER_SKILLS)
            max_range = random.choice([5.0, 10.0, 15.0])
            name = HELPER_NAMES[i % len(HELPER_NAMES)]
            contact = f"+44 7{random.randint(100000000, 999999999)}"

            # Create user with location
            cursor.execute(
                """
                INSERT INTO users (name, location, contact_info, helper_skills, helper_max_range)
                VALUES (%s, POINT(%s, %s), %s, %s, %s)
                RETURNING id
                """,
                (name, lat, lon, contact, skills, max_range)
            )
            user_id = cursor.fetchone()['id']
            helper_ids.append(user_id)

            # Add location tracking
            cursor.execute(
                """
                INSERT INTO location_tracking (user_id, location)
                VALUES (%s, POINT(%s, %s))
                """,
                (user_id, lat, lon)
            )

            print(f"  ✓ {name} ({area_name}) - Skills: {', '.join(skills)} - Range: {max_range}km")

        print(f"\n✅ Created {count} helpers")
        return helper_ids


def seed_callers_with_cases(count=25):
    """Create caller users with active help requests around London"""
    with get_db_cursor() as cursor:
        print(f"\n📞 Creating {count} callers with help requests...")

        case_ids = []
        for i in range(count):
            area_name, area_lat, area_lon = random.choice(LONDON_AREAS)
            lat, lon = add_random_offset(area_lat, area_lon, max_km=1.5)

            name = CALLER_NAMES[i % len(CALLER_NAMES)]
            contact = f"+44 7{random.randint(100000000, 999999999)}"

            # Create user with location
            cursor.execute(
                """
                INSERT INTO users (name, location, contact_info)
                VALUES (%s, POINT(%s, %s), %s)
                RETURNING id
                """,
                (name, lat, lon, contact)
            )
            user_id = cursor.fetchone()['id']

            # Add location tracking
            cursor.execute(
                """
                INSERT INTO location_tracking (user_id, location)
                VALUES (%s, POINT(%s, %s))
                """,
                (user_id, lat, lon)
            )

            # Create case
            problem = random.choice(VICTIM_PROBLEMS)
            people_count = random.choice([1, 1, 2, 2, 3, 4, 5])  # Weighted toward 1-2 people
            urgency = random.choices(
                ['low', 'medium', 'high', 'critical'],
                weights=[10, 30, 40, 20]  # Weighted toward medium/high
            )[0]
            danger_level = random.choice(['moderate', 'severe', 'severe', 'life_threatening'])
            mobility_status = random.choice(['mobile', 'injured', 'trapped', None, None])

            vulnerability_factors = []
            if random.random() < 0.3:  # 30% chance of vulnerability factors
                possible_factors = ['elderly', 'children', 'disability', 'medical_condition', 'pregnancy']
                vulnerability_factors = random.sample(possible_factors, random.randint(1, 2))

            # Some cases are open, some assigned (for realism)
            status = random.choices(['open', 'assigned'], weights=[70, 30])[0]

            cursor.execute(
                """
                INSERT INTO cases (
                    caller_user_id, location, raw_problem_description,
                    people_count, urgency, danger_level, status,
                    mobility_status, vulnerability_factors, description
                )
                VALUES (%s, POINT(%s, %s), %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (
                    user_id, lat, lon, problem, people_count,
                    urgency, danger_level, status, mobility_status,
                    vulnerability_factors, problem
                )
            )
            case_id = cursor.fetchone()['id']
            case_ids.append(case_id)

            urgency_emoji = {
                'low': '🟢',
                'medium': '🟡',
                'high': '🟠',
                'critical': '🔴'
            }[urgency]

            print(f"  {urgency_emoji} {name} ({area_name}) - {problem[:50]}... - {people_count} people - {status}")

        print(f"\n✅ Created {count} callers with cases")
        return case_ids


def main():
    """Seed the database with sample data"""
    print("\n" + "="*70)
    print("🌍 SEEDING LONDON WITH SAMPLE DATA")
    print("="*70)

    try:
        helper_ids = seed_helpers(25)
        case_ids = seed_callers_with_cases(25)

        print("\n" + "="*70)
        print("✅ SEEDING COMPLETE")
        print("="*70)
        print(f"📊 Summary:")
        print(f"   - {len(helper_ids)} helpers created around London")
        print(f"   - {len(case_ids)} help requests created")
        print(f"\n💡 Helpers and cases are distributed across London neighborhoods")
        print(f"   View them on the map at http://localhost:5173\n")

    except Exception as e:
        print(f"\n❌ Error seeding data: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
