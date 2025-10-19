#!/bin/bash

# Script to register 20 users
# Usage: ./register_users.sh [BASE_URL]
# Default BASE_URL is http://localhost:8080

BASE_URL="${1:-http://localhost:8080}"

# Array of sample data
cities=("New York" "Los Angeles" "Chicago" "Houston" "Phoenix" "Philadelphia" "San Antonio" "San Diego" "Dallas" "Austin")
genders=("M" "F" )

# Register 20 users
for i in {1..20}; do
  # Generate user data
  name="User${i}"
  email="user${i}@example.com"
  password="password123"
  gender=${genders[$((i % 2))]}
  age=$((20 + (i % 30)))
  city=${cities[$((i % 10))]}
  
  echo "Registering user $i: $name ($email)"
  
  # Make the curl request
  response=$(curl -s -X POST "${BASE_URL}/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$name\",
      \"email\": \"$email\",
      \"password\": \"$password\",
      \"gender\": \"$gender\",
      \"age\": $age,
      \"city\": \"$city\"
    }")
  
  echo "Response: $response"
  echo "---"
  sleep 0.5  # Small delay to avoid overwhelming the server
done

echo "All 20 users registered!"
