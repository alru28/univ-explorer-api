db = db.getSiblingDB('exploration_db');  // Switch to the target database

db.createUser({
  user: "mongo_user",
  pwd: "mongo_pass",
  roles: [{ role: "readWrite", db: "exploration_db" }]
});