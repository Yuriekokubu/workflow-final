# Use debian:12-slim as the base image
FROM debian:12-slim

# Environment variables for PostgreSQL
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_DB=budget_workflow
ENV PGDATA=/var/lib/postgresql/data

# Install necessary packages and PostgreSQL 16
RUN apt-get update \
    && apt-get install -y wget gnupg2 lsb-release ca-certificates \
    && echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - \
    && apt-get update \
    && apt-get install -y postgresql-16 postgresql-client-16 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Ensure PostgreSQL binaries are in the PATH
ENV PATH="/usr/lib/postgresql/16/bin:${PATH}"

# Expose PostgreSQL port
EXPOSE 5432

# Set the default command to run PostgreSQL
USER postgres
CMD ["postgres", "-D", "/var/lib/postgresql/data"]
