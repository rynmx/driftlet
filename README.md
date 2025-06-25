# driftlet

a minimalist, modern, and performant blogging and portfolio platform.

**note**: this is a very early-stage project. things may be broken or incomplete.

## getting started (dev)

### 1. set up the database

this project uses docker to run a postgresql database. make sure you have docker and docker-compose installed.

```bash
docker-compose up -d
```

### 2. configure environment variables

create a `.env.local` file in the root of the project and add the following:

```env
# nextauth secret - change this to a random string
NEXTAUTH_SECRET=your-super-secret-key

# database connection (matches docker-compose.yml)
DATABASE_USER=user
DATABASE_PASSWORD=password
DATABASE_NAME=driftlet
DATABASE_URL="postgresql://user:password@localhost:5432/driftlet"
```

### 3. install dependencies

```bash
npm install
```

### 4. set up the database

run the following commands to initialize the database schema and seed it with initial data.

```bash
# create the necessary tables
npm run db:init

# seed the database with a default user
npm run db:seed
```

### 5. run the development server

```bash
npm run dev
```

open [http://localhost:3000](http://localhost:3000)

### 6. logging in

the database is seeded with a default user:

- **username**: `admin`
- **password**: `password`

you need to manually go to [http://localhost:3000/login](http://localhost:3000/login) to login as the login button is hidden.
