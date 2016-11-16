class UserRequestsController < ApplicationController
  before_action :set_user_request, only: [:show, :edit, :update, :destroy]

  # GET /user_requests
  # GET /user_requests.json
  def index
    @user_requests = UserRequest.all
  end

  # GET /user_requests/1
  # GET /user_requests/1.json
  def show
  end

  # GET /user_requests/new
  def new
    @user_request = UserRequest.new
  end

  # GET /user_requests/1/edit
  def edit
  end

  # POST /user_requests
  # POST /user_requests.json
  def create
    @user_request = UserRequest.new(user_request_params)

    respond_to do |format|
      if @user_request.save
        format.html { redirect_to @user_request, notice: 'User request was successfully created.' }
        format.json { render :show, status: :created, location: @user_request }
      else
        format.html { render :new }
        format.json { render json: @user_request.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /user_requests/1
  # PATCH/PUT /user_requests/1.json
  def update
    respond_to do |format|
      if @user_request.update(user_request_params)
        format.html { redirect_to @user_request, notice: 'User request was successfully updated.' }
        format.json { render :show, status: :ok, location: @user_request }
      else
        format.html { render :edit }
        format.json { render json: @user_request.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /user_requests/1
  # DELETE /user_requests/1.json
  def destroy
    @user_request.destroy
    respond_to do |format|
      format.html { redirect_to user_requests_url, notice: 'User request was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_user_request
      @user_request = UserRequest.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def user_request_params
      params.require(:user_request).permit(:name, :slack, :email, :skills, :interest)
    end
end
