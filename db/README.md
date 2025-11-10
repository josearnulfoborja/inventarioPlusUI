DB helper scripts for placeholders and prestamos with optional especialista

Files created:
- insert_placeholders_clientes_mysql.sql
- insert_placeholders_usuarios_mysql.sql
- insert_placeholders_especialistas_mysql.sql
- insert_placeholders_equipos_mysql.sql
- inserts_prestamos_especialista_opcional_mysql.sql

How to run (PowerShell / mysql client):

mysql -u <user> -p -h <host> <database> < .\db\insert_placeholders_clientes_mysql.sql
mysql -u <user> -p -h <host> <database> < .\db\insert_placeholders_usuarios_mysql.sql
mysql -u <user> -p -h <host> <database> < .\db\insert_placeholders_especialistas_mysql.sql
mysql -u <user> -p -h <host> <database> < .\db\insert_placeholders_equipos_mysql.sql
# Finally insert prestamos (after parents exist):
mysql -u <user> -p -h <host> <database> < .\db\inserts_prestamos_especialista_opcional_mysql.sql

Notes:
- The prestamos script omits id_prestamo (AUTO_INCREMENT). If your table defines id_prestamo manually, either add the column to the list and values, or remove AUTO_INCREMENT and insert ids explicitly.
- The prestamos rows set especialista fields to NULL when not required; only set the specialist columns when a specialist is assigned.
- Adjust column names to match your exact schema (use `DESCRIBE prestamos;`).
