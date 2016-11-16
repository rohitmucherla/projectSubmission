json.extract! user_request, :id, :name, :slack, :email, :skills, :interest, :created_at, :updated_at
json.url user_request_url(user_request, format: :json)