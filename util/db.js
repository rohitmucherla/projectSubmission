var db = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: "./projectsubmission.sqlite"
  },
  useNullAsDefault: false
});

db.schema.createTable('test',function(t)
{
	t.increments();
	t.string('name');
});