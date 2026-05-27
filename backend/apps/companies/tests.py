from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from apps.companies.models import Company, UserProfile

class UserRegistrationTestCase(APITestCase):
    def test_register_user_success(self):
        url = '/api/auth/register/'
        data = {
            'username': 'new_analyst',
            'password': 'password123',
            'email': 'new_analyst@breathe.com'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], 'User registered successfully!')
        
        # Verify database objects
        user = User.objects.get(username='new_analyst')
        self.assertTrue(user.check_password('password123'))
        self.assertEqual(user.email, 'new_analyst@breathe.com')
        
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.company.name, 'Breathe ESG Corp')

    def test_register_user_duplicate_username(self):
        # Create an existing user first
        User.objects.create_user(username='existing_user', password='password123')
        
        url = '/api/auth/register/'
        data = {
            'username': 'existing_user',
            'password': 'newpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Username already exists.')

    def test_register_user_missing_fields(self):
        url = '/api/auth/register/'
        # Missing password
        data = {
            'username': 'user1'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Username and password are required.')

