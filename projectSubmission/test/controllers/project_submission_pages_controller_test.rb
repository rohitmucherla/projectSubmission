require 'test_helper'

class ProjectSubmissionPagesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @project_submission_page = project_submission_pages(:one)
  end

  test "should get index" do
    get project_submission_pages_url
    assert_response :success
  end

  test "should get new" do
    get new_project_submission_page_url
    assert_response :success
  end

  test "should create project_submission_page" do
    assert_difference('ProjectSubmissionPage.count') do
      post project_submission_pages_url, params: { project_submission_page: { description: @project_submission_page.description, email: @project_submission_page.email, name: @project_submission_page.name, organization: @project_submission_page.organization, paid: @project_submission_page.paid, skills: @project_submission_page.skills, slack: @project_submission_page.slack, teamSize: @project_submission_page.teamSize, timeframe: @project_submission_page.timeframe } }
    end

    assert_redirected_to project_submission_page_url(ProjectSubmissionPage.last)
  end

  test "should show project_submission_page" do
    get project_submission_page_url(@project_submission_page)
    assert_response :success
  end

  test "should get edit" do
    get edit_project_submission_page_url(@project_submission_page)
    assert_response :success
  end

  test "should update project_submission_page" do
    patch project_submission_page_url(@project_submission_page), params: { project_submission_page: { description: @project_submission_page.description, email: @project_submission_page.email, name: @project_submission_page.name, organization: @project_submission_page.organization, paid: @project_submission_page.paid, skills: @project_submission_page.skills, slack: @project_submission_page.slack, teamSize: @project_submission_page.teamSize, timeframe: @project_submission_page.timeframe } }
    assert_redirected_to project_submission_page_url(@project_submission_page)
  end

  test "should destroy project_submission_page" do
    assert_difference('ProjectSubmissionPage.count', -1) do
      delete project_submission_page_url(@project_submission_page)
    end

    assert_redirected_to project_submission_pages_url
  end
end
