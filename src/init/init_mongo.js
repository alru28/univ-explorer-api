db = db.getSiblingDB('exploration_db');

db.createUser({
  user: "mongo_user",
  pwd: "mongo_pass",
  roles: [{ role: "readWrite", db: "exploration_db" }]
});