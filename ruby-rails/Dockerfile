FROM ruby:3.3-alpine

RUN apk add --no-cache build-base postgresql-dev tzdata yaml-dev

WORKDIR /app

COPY Gemfile Gemfile.lock* ./
RUN bundle config set --local without 'development test' \
  && bundle install

COPY . .

ENV RAILS_ENV=production
ENV PORT=3003

EXPOSE 3003
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
