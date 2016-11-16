class ProjectSubmissionPagesController < ApplicationController
  before_action :set_project_submission_page, only: [:show, :edit, :update, :destroy]

  # GET /project_submission_pages
  # GET /project_submission_pages.json
  def index
    @project_submission_pages = ProjectSubmissionPage.all
  end

  # GET /project_submission_pages/1
  # GET /project_submission_pages/1.json
  def show
  end

  # GET /project_submission_pages/new
  def new
    @project_submission_page = ProjectSubmissionPage.new
  end

  # GET /project_submission_pages/1/edit
  def edit
  end

  # POST /project_submission_pages
  # POST /project_submission_pages.json
  def create
    @project_submission_page = ProjectSubmissionPage.new(project_submission_page_params)

    respond_to do |format|
      if @project_submission_page.save
        format.html { redirect_to @project_submission_page, notice: 'Project submission page was successfully created.' }
        format.json { render :show, status: :created, location: @project_submission_page }
      else
        format.html { render :new }
        format.json { render json: @project_submission_page.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /project_submission_pages/1
  # PATCH/PUT /project_submission_pages/1.json
  def update
    respond_to do |format|
      if @project_submission_page.update(project_submission_page_params)
        format.html { redirect_to @project_submission_page, notice: 'Project submission page was successfully updated.' }
        format.json { render :show, status: :ok, location: @project_submission_page }
      else
        format.html { render :edit }
        format.json { render json: @project_submission_page.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /project_submission_pages/1
  # DELETE /project_submission_pages/1.json
  def destroy
    @project_submission_page.destroy
    respond_to do |format|
      format.html { redirect_to project_submission_pages_url, notice: 'Project submission page was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_project_submission_page
      @project_submission_page = ProjectSubmissionPage.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def project_submission_page_params
      params.require(:project_submission_page).permit(:name, :email, :slack, :organization, :description, :skills, :timeframe, :teamSize, :paid)
    end
end
