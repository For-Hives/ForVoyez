# ForVoyez README

## (todo)

## Dev 
### Posgresql
```bash
docker run --name <name>-postgres -e POSTGRES_PASSWORD=<password> -e POSTGRES_USER=<username> -e PGDATA=/var/lib/postgresql/data/pgdata -v /db/<dbname>:/var/lib/postgresql/data -p 5432:5432 -d postgres
```
E.g.
```bash
docker run --name forvoyez-postgres -e POSTGRES_PASSWORD=123456 -e POSTGRES_USER=forvoyez -e PGDATA=/var/lib/postgresql/data/pgdata -v /db/forvoyez:/var/lib/postgresql/data -p 5432:5432 -d postgres
```

La chaines de connexion est la suivante:
```bash
postgresql://forvoyez:123456@localhost:5432/forvoyez
```