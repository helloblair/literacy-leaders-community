from django.test import TestCase

from .models import District


class DistrictModelTest(TestCase):
    def setUp(self):
        self.district = District.objects.create(
            nces_id="0600006",
            name="Los Angeles Unified",
            state="CA",
            locale_type=District.LOCALE_URBAN,
            enrollment=596937,
            frl_percentage=72.10,
            ell_percentage=19.80,
        )

    def test_str_representation(self):
        self.assertEqual(str(self.district), "Los Angeles Unified (CA)")

    def test_nces_id_unique(self):
        with self.assertRaises(Exception):
            District.objects.create(
                nces_id="0600006",
                name="Duplicate District",
                state="CA",
                locale_type=District.LOCALE_URBAN,
                enrollment=1000,
                frl_percentage=50.00,
                ell_percentage=10.00,
            )

    def test_locale_choices(self):
        valid_locales = [District.LOCALE_URBAN, District.LOCALE_SUBURBAN, District.LOCALE_TOWN, District.LOCALE_RURAL]
        self.assertIn(self.district.locale_type, valid_locales)

    def test_timestamps_auto_set(self):
        self.assertIsNotNone(self.district.created_at)
        self.assertIsNotNone(self.district.updated_at)

    def test_filter_by_state(self):
        District.objects.create(
            nces_id="1700099",
            name="Chicago Public Schools",
            state="IL",
            locale_type=District.LOCALE_URBAN,
            enrollment=323323,
            frl_percentage=77.50,
            ell_percentage=16.90,
        )
        ca_districts = District.objects.filter(state="CA")
        il_districts = District.objects.filter(state="IL")
        self.assertEqual(ca_districts.count(), 1)
        self.assertEqual(il_districts.count(), 1)

    def test_filter_by_locale(self):
        District.objects.create(
            nces_id="4800016",
            name="Laredo ISD",
            state="TX",
            locale_type=District.LOCALE_RURAL,
            enrollment=24509,
            frl_percentage=91.20,
            ell_percentage=55.30,
        )
        urban = District.objects.filter(locale_type=District.LOCALE_URBAN)
        rural = District.objects.filter(locale_type=District.LOCALE_RURAL)
        self.assertEqual(urban.count(), 1)
        self.assertEqual(rural.count(), 1)
