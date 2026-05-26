FROM golang:1.23-alpine AS builder

WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o server ./cmd/server

FROM alpine:3.21
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 3006
CMD ["./server"]
