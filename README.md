# RankRise

The goal of this website is to help users choose the best product in their case.

The technology goal is to design best-practice modern RESTful API with Django.

**Idea**:

- Q/A website (question answer/solution/option/recommendation)

- Voting platform

- Recommendation platform

- Ranking platform

- Suggesting platform

- Comparison website

- Alternative searching platform

- Product rating platform

- Community centered

**Features**:

- User has username, email and avatar + social auth?

- Ask questions

- Answers as products (services)

- Product/service search/suggesting

- Question tags/categories (categorization)

- Multilayer categories

- Pros/Cons answer rating

- Pros/Cons commenting

- Answer name, website link, images, videos (links)

- Answer rank (rating) calculation/*algorithm*

- Questing/answer search

- API request throttling

- API testing & documenting

- Reporting feature (report questions/products/answers/comments)

- Question/product throttling/ban

- Follow question options/last update

- Question comments

- Question sharing/linking

- Option score calculation

- Product community specs (+proc/con comments)

- Product price (free, paid, open-source)

- Recommendation community agreement

- Vote against question, product, option, argument, etc.

**Similar websites**:

- Twitter, Reddit

- Quora, StackOverflow

- Slant, ProductHunt

- Alternative.to

**Plan**:

- Project development setup

- Authentication/Authorization

- Documentation

- Automated testing + test coverage

- CRUD components API
  
  - Model
  
  - Serializer
  
  - API view/view set
  
  - Manual testing
  
  - Automated testing

**Technology stack** (technologies involved in the project):

- Python, Django, Django REST Framework, PostgreSQL

- dj_rest_auth, pytest/coverage, Swagger, django_dotenv

- black, pylint, isort, rope

- AWS/Heroku, Docker, Compose, Github, CI/CD

**Technological features**:

- OpenAPI, Swagger

- JWT authentication

- Test driven development

- Pagination

- Database search

Nice to have:

- Throttling
- Caching
- Versioning
- Container debugging

**Roadmap**:

- [x] dockerize project + PostgreSQL (setup dev environment)

- [x] migrate + custom user model

- [x] move from session to JWT authentication

- [x] authentication endpoints

- [x] API documentation generation

- [x] Automated testing

- [x] Questioning feature

- [x] Test-driven development

- [x] Product CRUD

- [x] Filtering API

- [x] Option

- [x] Recommendation (voting)

- [ ] Ranking (SQL + ORM)

- [ ] Product dataset

- [ ] Categorization

- [ ] Argument

- [ ] Reporting

## Question

Questions are the core of API.

API:

- Users (authenticated) can only ask questions. There should be some kind of throttling to prevent users from spamming a lot of questions. 

- Any one can only list and retrieve questions.

- Only admins can delete or update questions (maybe based on reports).

API:

- list, retrieve - unauthenticated users

- create - authenticated users

- update, destroy - authenticated staff users

Models:

- Questions aren't bind to any user (not owned). A question is just a small text around 100 characters which has some (category) and ask_time. Question should be looked up by primary key (integer id or character slug).

## Product

Product represent some product or service that can be recommended as an option to specific question. Usually it is online/software or Internet service/product. 

- id

- name (title, help text: you can not change name after)

- slug (automatically based on name)

- description

- images (links or *filesystem storage*: Django package)

- product website link

- price/cost (*choices* from: open source, free, paid)

Validation/Model:

- id is a auto incrementing primary key (model)

- name and slug must be unique

- price should contain values only from choices

- website link must be valid URL

- description can be blank

- slug (URI) must not update after name update

- name and slug can not be changed in serializer/API

- name can not be blank

- description, website can be blank

- price default set to free (model)

- name must be <= 50 characters

- images must have image media type

URLs:

- Products should be available under /products/ URL

Serialization:

- Products should include images objects

API permissions:

- retrieve, list: unauthenticated

- create: authenticated

- delete: staff

### Product image

Image of the product, has the have API permissions as product.

Model:

- image field
  
  - 300x200
  
  - JPEG
  
  - 80% source quality

Permissions:

- Same as models

URL:

- Image will be available under /products/images/ (validate product slug != images)

## Filtering

API should also provide ability to make filtered queries:

- filter by equal, greater, etc.

- search query

- ordering of the result

- pagination of large amount of data

**Question**:

- search by question title (case insensitive partial match)

- order by latest/oldest ask time (default=latest)

- paginate questions by 20

**Product**:

- search word contains in product name

- full-text search by product description

- filter products by price

- paginate by 10

## Options

Community can suggests options which are products recommended to specific question.

Model:

- option connects together question and product (answer to question).

Permissions:

- options follow the same community rules, you can only get and create them. 

- admins can delete suggested options if they are not appropriate.

Relations:

- If question is deleted, option should be deleted also (options).

- If product is deleted, option FK to product should be set to NULL (recommendations).

Routers (URL design):

- Options will be nested up on question or product (`/questions/<question_id>/options/<option_id>/`)

Requirements:

- Pagination by 10. Ordering by rank (descending).

- Question and product foreign keys should be unique together.

## Recommendation

Voting about suggested options is in the core of recommendation system.

Design:

- recommend or not recommend this option (upvote or downvote)

- write Pro/Con argument about option usage, share opinion

- like (upvote/downvote) top arguments

- comment on argument comments

- options will be ranked based on user votes and arguments

**Vote**:

- Vote should connect option and user (+ vote time)

- Vote option and user data are write-only

- Users can only once vote against specific option (unique together)

- Vote can be either up or down (and can be switched after)

- If option is deleted all votes should be too, if user is deleted all votes should stay (and set user to NULL)

- Votes will be available under `*/options/<option_id>/` route
  
  - Because `<option_id>` auto increment is absolute, it is not required to pass `<question_id>` in the `reverse(url_name)` 
  
  - `<question_id>` from URI is required and still used for additional validation.

- Vote displaying should be anonymous (not voter information returned) only vote rate information (up/down) (*write-only*).

- Unauthenticated users can read/list, authenticated can also create votes, update  and delete *their* votes. Admins can do anything.

- Option should have convenient calculate fields (attributes: properties/methods.) or manager to get upvotes or downvotes count.

- Filter option votes based on up or down status (rate). Like `?up=True` or `?up=False`

- No API pagination for votes, ordering by latest vote time, filtering by up/down.

- Vote user should be determined automatically based on request session user.
  
  - vote user must be set to `request.user`
  
  - vote create API shouldn't display `user` in OpenAPI documentation (or note that it is get from request session)

- `option` and `user` API arguments will be determined from *URL* option and *session* user (arguments in body will be ignored).

## Ranking

Ranking system is used to sort options from best scored to less ones.

Input:

- votes
  
  - upvotes
  
  - downvotes

- arguments
  
  - count
  
  - pros
  
  - cons

- comments

- etc.

Ranking data math will be based on on:

- JavaScript

- Python

- **SQL/ORM query**

- UPDATE row

Features:

- Query upvotes and downvotes of option should be available as option properties.
  
  - filter and count votes

- Upvotes and downvotes should be included in serializer as read-only fields.

- Upvotes and downvotes should be in rendered JSON data

- Rating is only used to order objects

- Rank is displayed in the data

### Algorithm

Rating:

$$
rating = upvotes - (downvotes * \frac{3}{4})
$$

Rank point:

$$
point = \frac{max(score)}{100}
$$

Rank:

$$
rank = \frac{rating}{point}-\frac{downvotes}{upvotes}*10
$$