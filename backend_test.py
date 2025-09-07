#!/usr/bin/env python3
"""
Backend API Testing for Exercise Timer App
Tests all backend endpoints and functionality
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Any

# Backend URL from frontend .env
BACKEND_URL = "https://simple-hiit-timer.preview.emergentagent.com/api"

class ExerciseTimerAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_basic_connectivity(self):
        """Test basic API connectivity"""
        try:
            response = self.session.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                if "Exercise Timer API" in data.get("message", ""):
                    self.log_test("Basic API Connectivity", True, f"API version: {data.get('version')}")
                    return True
                else:
                    self.log_test("Basic API Connectivity", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_test("Basic API Connectivity", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Basic API Connectivity", False, f"Connection error: {str(e)}")
            return False

    def test_status_endpoint(self):
        """Test status check endpoints"""
        try:
            # Test POST /status
            test_data = {"client_name": "backend_test_client"}
            response = self.session.post(f"{self.base_url}/status", json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and data["client_name"] == "backend_test_client":
                    self.log_test("POST /status", True, f"Created status check with ID: {data['id']}")
                else:
                    self.log_test("POST /status", False, f"Invalid response structure: {data}")
                    return False
            else:
                self.log_test("POST /status", False, f"HTTP {response.status_code}: {response.text}")
                return False

            # Test GET /status
            response = self.session.get(f"{self.base_url}/status")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_test("GET /status", True, f"Retrieved {len(data)} status checks")
                    return True
                else:
                    self.log_test("GET /status", False, f"Expected list with data, got: {data}")
                    return False
            else:
                self.log_test("GET /status", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Status Endpoints", False, f"Error: {str(e)}")
            return False

    def test_exercises_api(self):
        """Test exercise management API"""
        try:
            # Test GET /exercises (should return default exercises)
            response = self.session.get(f"{self.base_url}/exercises")
            if response.status_code != 200:
                self.log_test("GET /exercises", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            exercises = response.json()
            if not isinstance(exercises, list):
                self.log_test("GET /exercises", False, f"Expected list, got: {type(exercises)}")
                return False
            
            # Should have default exercises
            expected_names = ["Push-ups", "Squats", "Jumping Jacks", "Mountain Climbers"]
            exercise_names = [ex.get("name") for ex in exercises]
            
            if all(name in exercise_names for name in expected_names):
                self.log_test("GET /exercises - Default Data", True, f"Found all default exercises: {exercise_names}")
            else:
                self.log_test("GET /exercises - Default Data", False, f"Missing default exercises. Found: {exercise_names}")
                return False

            # Test POST /exercises (create new exercise)
            new_exercise = {
                "name": "Burpees",
                "description": "Full body explosive movement",
                "isActive": True
            }
            response = self.session.post(f"{self.base_url}/exercises", json=new_exercise)
            if response.status_code != 200:
                self.log_test("POST /exercises", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            created_exercise = response.json()
            if created_exercise.get("name") == "Burpees" and "id" in created_exercise:
                self.log_test("POST /exercises", True, f"Created exercise with ID: {created_exercise['id']}")
                exercise_id = created_exercise["id"]
            else:
                self.log_test("POST /exercises", False, f"Invalid response: {created_exercise}")
                return False

            # Test PUT /exercises/{id} (update exercise)
            update_data = {"description": "Updated: Full body explosive movement", "isActive": False}
            response = self.session.put(f"{self.base_url}/exercises/{exercise_id}", json=update_data)
            if response.status_code != 200:
                self.log_test("PUT /exercises/{id}", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            updated_exercise = response.json()
            if updated_exercise.get("description") == "Updated: Full body explosive movement" and updated_exercise.get("isActive") == False:
                self.log_test("PUT /exercises/{id}", True, "Successfully updated exercise")
            else:
                self.log_test("PUT /exercises/{id}", False, f"Update failed: {updated_exercise}")
                return False

            # Test DELETE /exercises/{id}
            response = self.session.delete(f"{self.base_url}/exercises/{exercise_id}")
            if response.status_code != 200:
                self.log_test("DELETE /exercises/{id}", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            delete_response = response.json()
            if "deleted successfully" in delete_response.get("message", ""):
                self.log_test("DELETE /exercises/{id}", True, "Successfully deleted exercise")
            else:
                self.log_test("DELETE /exercises/{id}", False, f"Unexpected response: {delete_response}")
                return False

            return True

        except Exception as e:
            self.log_test("Exercise API", False, f"Error: {str(e)}")
            return False

    def test_settings_api(self):
        """Test workout settings API"""
        try:
            # Test GET /settings (should return default settings)
            response = self.session.get(f"{self.base_url}/settings")
            if response.status_code != 200:
                self.log_test("GET /settings", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            settings = response.json()
            expected_fields = ["workTime", "restTime", "setsPerExercise", "circuits", "userId"]
            if all(field in settings for field in expected_fields):
                self.log_test("GET /settings - Default Data", True, f"Default settings: workTime={settings['workTime']}, restTime={settings['restTime']}")
            else:
                self.log_test("GET /settings - Default Data", False, f"Missing fields in settings: {settings}")
                return False

            # Test POST /settings (create/update settings)
            new_settings = {
                "workTime": 45,
                "restTime": 15,
                "setsPerExercise": 4,
                "circuits": 3,
                "userId": "test_user"
            }
            response = self.session.post(f"{self.base_url}/settings", json=new_settings)
            if response.status_code != 200:
                self.log_test("POST /settings", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            created_settings = response.json()
            if created_settings.get("workTime") == 45 and created_settings.get("restTime") == 15:
                self.log_test("POST /settings", True, f"Created settings for user: {created_settings['userId']}")
            else:
                self.log_test("POST /settings", False, f"Invalid response: {created_settings}")
                return False

            # Test PUT /settings (update settings)
            update_data = {"workTime": 50, "circuits": 5}
            response = self.session.put(f"{self.base_url}/settings?user_id=test_user", json=update_data)
            if response.status_code != 200:
                self.log_test("PUT /settings", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            updated_settings = response.json()
            if updated_settings.get("workTime") == 50 and updated_settings.get("circuits") == 5:
                self.log_test("PUT /settings", True, "Successfully updated settings")
            else:
                self.log_test("PUT /settings", False, f"Update failed: {updated_settings}")
                return False

            return True

        except Exception as e:
            self.log_test("Settings API", False, f"Error: {str(e)}")
            return False

    def test_sessions_api(self):
        """Test workout sessions API"""
        try:
            # First get exercises and settings for session creation
            exercises_response = self.session.get(f"{self.base_url}/exercises")
            settings_response = self.session.get(f"{self.base_url}/settings")
            
            if exercises_response.status_code != 200 or settings_response.status_code != 200:
                self.log_test("Sessions API - Prerequisites", False, "Could not get exercises or settings")
                return False
            
            exercises = exercises_response.json()[:2]  # Use first 2 exercises
            settings = settings_response.json()
            
            # Test POST /sessions (create session)
            session_data = {
                "exercises": exercises,
                "settings": settings,
                "userId": "test_user"
            }
            response = self.session.post(f"{self.base_url}/sessions", json=session_data)
            if response.status_code != 200:
                self.log_test("POST /sessions", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            created_session = response.json()
            if "id" in created_session and created_session.get("status") == "active":
                self.log_test("POST /sessions", True, f"Created session with ID: {created_session['id']}")
                session_id = created_session["id"]
            else:
                self.log_test("POST /sessions", False, f"Invalid response: {created_session}")
                return False

            # Test GET /sessions
            response = self.session.get(f"{self.base_url}/sessions?user_id=test_user")
            if response.status_code != 200:
                self.log_test("GET /sessions", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            sessions = response.json()
            if isinstance(sessions, list) and len(sessions) > 0:
                self.log_test("GET /sessions", True, f"Retrieved {len(sessions)} sessions")
            else:
                self.log_test("GET /sessions", False, f"Expected list with sessions, got: {sessions}")
                return False

            # Test PUT /sessions/{id}/complete
            response = self.session.put(f"{self.base_url}/sessions/{session_id}/complete?completed_sets=3&completed_circuits=2")
            if response.status_code != 200:
                self.log_test("PUT /sessions/{id}/complete", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            complete_response = response.json()
            if "completed successfully" in complete_response.get("message", ""):
                self.log_test("PUT /sessions/{id}/complete", True, "Successfully completed session")
            else:
                self.log_test("PUT /sessions/{id}/complete", False, f"Unexpected response: {complete_response}")
                return False

            return True

        except Exception as e:
            self.log_test("Sessions API", False, f"Error: {str(e)}")
            return False

    def test_stats_api(self):
        """Test workout statistics API"""
        try:
            response = self.session.get(f"{self.base_url}/stats?user_id=test_user")
            if response.status_code != 200:
                self.log_test("GET /stats", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            stats = response.json()
            expected_fields = ["totalSessions", "totalDuration", "avgDuration", "totalSets", "totalCircuits"]
            if all(field in stats for field in expected_fields):
                self.log_test("GET /stats", True, f"Stats: {stats['totalSessions']} sessions, {stats['totalSets']} sets")
                return True
            else:
                self.log_test("GET /stats", False, f"Missing fields in stats: {stats}")
                return False

        except Exception as e:
            self.log_test("Stats API", False, f"Error: {str(e)}")
            return False

    def test_error_handling(self):
        """Test API error handling"""
        try:
            # Test 404 for non-existent exercise
            response = self.session.get(f"{self.base_url}/exercises/non-existent-id")
            # This should return 200 with empty list or handle gracefully
            
            # Test 404 for updating non-existent exercise
            response = self.session.put(f"{self.base_url}/exercises/non-existent-id", json={"name": "test"})
            if response.status_code == 404:
                self.log_test("Error Handling - 404 Exercise", True, "Correctly returned 404 for non-existent exercise")
            else:
                self.log_test("Error Handling - 404 Exercise", False, f"Expected 404, got {response.status_code}")
                return False

            # Test invalid data
            response = self.session.post(f"{self.base_url}/exercises", json={"invalid": "data"})
            if response.status_code in [400, 422]:  # FastAPI returns 422 for validation errors
                self.log_test("Error Handling - Invalid Data", True, f"Correctly rejected invalid data with {response.status_code}")
            else:
                self.log_test("Error Handling - Invalid Data", False, f"Expected 400/422, got {response.status_code}")
                return False

            return True

        except Exception as e:
            self.log_test("Error Handling", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("EXERCISE TIMER APP - BACKEND API TESTING")
        print("=" * 60)
        print(f"Testing backend at: {self.base_url}")
        print()

        # Run tests in order
        tests = [
            ("Basic Connectivity", self.test_basic_connectivity),
            ("Status Endpoints", self.test_status_endpoint),
            ("Exercise Management API", self.test_exercises_api),
            ("Workout Settings API", self.test_settings_api),
            ("Workout Sessions API", self.test_sessions_api),
            ("Statistics API", self.test_stats_api),
            ("Error Handling", self.test_error_handling)
        ]

        passed = 0
        total = len(tests)

        for test_name, test_func in tests:
            print(f"Running {test_name}...")
            if test_func():
                passed += 1
            time.sleep(0.5)  # Small delay between tests

        print("=" * 60)
        print(f"BACKEND TESTING COMPLETE: {passed}/{total} test groups passed")
        print("=" * 60)

        # Print summary
        print("\nDETAILED TEST RESULTS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}")
            if result["details"]:
                print(f"   {result['details']}")

        return passed == total

if __name__ == "__main__":
    tester = ExerciseTimerAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 ALL BACKEND TESTS PASSED!")
        exit(0)
    else:
        print("\n❌ SOME BACKEND TESTS FAILED!")
        exit(1)