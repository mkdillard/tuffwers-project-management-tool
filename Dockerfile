FROM rust:1.45 AS server

#Create new project
RUN USER=root cargo new --bin tpmt

# Set working directory
WORKDIR /tpmt

# Copy app into working directory and build for dependency layer
COPY ./server/Cargo.toml ./Cargo.toml
RUN cargo build --release
RUN rm src/*.rs

# copy server code and build
COPY ./server/ ./

RUN rm ./target/release/deps/tpmt*
RUN cargo build --release



FROM node:14.7 as client

# Create working directory
RUN mkdir -p /client
WORKDIR /client

# Copy app into working directory
COPY ./frontend/ ./

RUN yarn install
RUN yarn build



FROM debian:buster-slim
ARG APP=/usr/src/app

RUN apt-get update \
    && apt-get install -y ca-certificates tzdata \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8000

ENV TZ=Etc/UTC \
    APP_USER=appuser \
    ROCKET_PORT=$PORT \
    ROCKET_KEEP_ALIVE=5

RUN groupadd $APP_USER \
    && useradd -g $APP_USER $APP_USER \
    && mkdir -p ${APP}/static

COPY --from server /tpmt/target/release/tpmt ${APP}/tpmt_server
COPY --from client /client/dist/ ${APP}/static/

RUN chown -R $APP_USER:$APP_USER ${APP}

USER $APP_USER
WORKDIR ${APP}

CMD ["./tpmt_server"] 