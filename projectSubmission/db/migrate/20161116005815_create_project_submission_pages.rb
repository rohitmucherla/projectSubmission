class CreateProjectSubmissionPages < ActiveRecord::Migration[5.0]
  def change
    create_table :project_submission_pages do |t|
      t.string :name
      t.string :email
      t.string :slack
      t.string :organization
      t.text :description
      t.text :skills
      t.string :timeframe
      t.string :teamSize
      t.string :paid

      t.timestamps
    end
  end
end
