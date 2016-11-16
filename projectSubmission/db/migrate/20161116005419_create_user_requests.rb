class CreateUserRequests < ActiveRecord::Migration[5.0]
  def change
    create_table :user_requests do |t|
      t.string :name
      t.string :slack
      t.string :email
      t.integer :skills
      t.integer :interest

      t.timestamps
    end
  end
end
