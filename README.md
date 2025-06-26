 <h1> <img src="./public/logo.png" width="25px" height="25px" /> driftlet</h1>

a minimalist, modern, and performant blogging and portfolio platform.

[Live Demo](https://ryanaque.com)

**note**: this is a very early-stage project. things may be broken or incomplete.

## roadmap for 1.0

- [x] create/edit/delete posts
- [x] basic account stuff
- [x] basic home page stuff
- [x] links
- [ ] page view tracker
- [ ] page tags
- [ ] basic theming
- [x] an actual icon for the project

## deploying

tbd, but just use docker but i use railway so hehe

### 1. populate .env

create a `.env` file in the root of the project and add the following:

```env
# nextauth secret - change this to a random string
NEXTAUTH_SECRET=your-super-secret-key

# database connection (matches docker-compose.yml)
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_NAME=driftlet
DATABASE_URL="postgresql://user:password@localhost:5432/driftlet"
```

### 2. run the server

```bash
docker compose up -d
```

your site should now be available at [http://localhost:3000](http://localhost:3000)

## getting started (dev)

### 1. populate .env

create a `.env` file in the root of the project and add the following:

```env
# nextauth secret - change this to a random string
NEXTAUTH_SECRET=your-super-secret-key

# database connection (matches docker-compose.yml)
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_NAME=driftlet
DATABASE_URL="postgresql://user:password@localhost:5432/driftlet"
```

### 2. set up the database

this project uses docker to run a postgresql database. make sure you have docker and docker-compose installed.

```bash
docker compose up -d db
```

### 3. install dependencies

```bash
npm install
```

### 4. run the development server

```bash
npm run dev
```

open [http://localhost:3000](http://localhost:3000)

### 5. logging in

the database is seeded with a default user:

- **username**: `admin`
- **password**: `password`

you need to manually go to [http://localhost:3000/login](http://localhost:3000/login) to login as the login button is hidden.

## contributing

contributions welcome! please open an issue or submit a pull request.
