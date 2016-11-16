require 'test_helper'

class UserRequestsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user_request = user_requests(:one)
  end

  test "should get index" do
    get user_requests_url
    assert_response :success
  end

  test "should get new" do
    get new_user_request_url
    assert_response :success
  end

  test "should create user_request" do
    assert_difference('UserRequest.count') do
      post user_requests_url, params: { user_request: { email: @user_request.email, interest: @user_request.interest, name: @user_request.name, skills: @user_request.skills, slack: @user_request.slack } }
    end

    assert_redirected_to user_request_url(UserRequest.last)
  end

  test "should show user_request" do
    get user_request_url(@user_request)
    assert_response :success
  end

  test "should get edit" do
    get edit_user_request_url(@user_request)
    assert_response :success
  end

  test "should update user_request" do
    patch user_request_url(@user_request), params: { user_request: { email: @user_request.email, interest: @user_request.interest, name: @user_request.name, skills: @user_request.skills, slack: @user_request.slack } }
    assert_redirected_to user_request_url(@user_request)
  end

  test "should destroy user_request" do
    assert_difference('UserRequest.count', -1) do
      delete user_request_url(@user_request)
    end

    assert_redirected_to user_requests_url
  end
end
