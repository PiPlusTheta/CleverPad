#!/usr/bin/env python3
"""Test script for guest login functionality"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_guest_login():
    """Test guest login and note operations"""
    print("Testing guest login functionality...")
    
    # 1. Test guest login
    print("\n1. Testing guest login...")
    response = requests.post(f"{BASE_URL}/auth/guest")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code != 200:
        print("❌ Guest login failed")
        return
    
    guest_data = response.json()
    session_id = guest_data["session_id"]
    print(f"✅ Guest login successful, session_id: {session_id}")
    
    # 2. Test getting notes without authentication (should return empty list)
    print("\n2. Testing get notes without authentication...")
    response = requests.get(f"{BASE_URL}/notes/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # 3. Test getting notes with session ID header
    print("\n3. Testing get notes with session ID...")
    headers = {"X-Session-Id": session_id}
    response = requests.get(f"{BASE_URL}/notes/", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("✅ Guest notes fetch successful")
    else:
        print("❌ Guest notes fetch failed")
        return
    
    # 4. Test creating a note as guest
    print("\n4. Testing create note as guest...")
    note_data = {
        "title": "Test Guest Note",
        "content": "This is a test note created by a guest user"
    }
    response = requests.post(f"{BASE_URL}/notes/", json=note_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 201:
        created_note = response.json()
        note_id = created_note["id"]
        print(f"✅ Guest note creation successful, note_id: {note_id}")
        
        # 5. Test getting notes again to see the created note
        print("\n5. Testing get notes again...")
        response = requests.get(f"{BASE_URL}/notes/", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # 6. Test updating the note
        print("\n6. Testing update note as guest...")
        updated_note_data = {
            "title": "Updated Guest Note",
            "content": "This note has been updated by a guest user"
        }
        response = requests.put(f"{BASE_URL}/notes/{note_id}", json=updated_note_data, headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Guest note update successful")
        else:
            print("❌ Guest note update failed")
        
        # 7. Test deleting the note
        print("\n7. Testing delete note as guest...")
        response = requests.delete(f"{BASE_URL}/notes/{note_id}", headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 204:
            print("✅ Guest note deletion successful")
        else:
            print("❌ Guest note deletion failed")
    else:
        print("❌ Guest note creation failed")

if __name__ == "__main__":
    test_guest_login()
