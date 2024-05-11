# ForVoyez README

## (todo)

## Dev 
### Posgresql
```bash
docker run --name <name>-postgres -e POSTGRES_PASSWORD=<password> -e POSTGRES_USER=<username> -e PGDATA=/var/lib/postgresql/data/pgdata -v /db/<dbname>:/var/lib/postgresql/data -p 5432:5432 -d postgres
```
E.g.
```bash
docker run --name forvoyez-pg -e POSTGRES_PASSWORD=123456789 -d -p 5432:5432 -v forvoyez-pg:/var/lib/postgresql/data postgres
```


La chaines de connexion est la suivante:
```bash
postgresql://forvoyez-pg:123456789@localhost:5432/forvoyez-pg
```