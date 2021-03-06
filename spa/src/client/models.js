export class QuestionsResponse {
  constructor(data) {
    this.count = data.count; // number of results on all pages
    this.next = data.next;
    this.previous = data.previous;
    this.results = data.results.map((result) => new Question(result));
  }
}

export class Question {
  constructor(data) {
    this.pk = data.pk;
    this.title = data.title;
    this.category = data.category;
    this.askTime = new Date(data.ask_time);
  }
}

export class User {
  constructor(data) {
    this.pk = data.pk;
    this.email = data.email;
    this.username = data.username;
  }
}

// List response model
class ListResponse {
  constructor(data) {
    this.count = data.count;
    this.next = data.next;
    this.previous = data.previous;
    this.results = data.results;
  }
}

// Option result model
export class Option {
  constructor(data) {
    this.id = data.id;
    this.question = data.question;
    this.product = data.product;
    this.upvotes = data.upvotes;
    this.downvotes = data.downvotes;
    this.rank = data.rank;
  }
}

export class OptionsModel extends ListResponse {
  constructor(data) {
    super(data);

    this.results = data.results.map((result) => new Option(result));
  }
}

// Price:
// Serialized: F, P, O
// Presented: Free, Paid, Open Source
// Accessed: Free, Paid, OpenSource

// Usage:
// const product1 = new Price("F");
// product1.price.presentation // Free
// product1.price.value === Price.Free

// Enumeration
export class Price {
  // Mapping for convenient comparison of prices
  static Free = "F";
  static Paid = "P";
  static OpenSource = "O";

  // Mapping for converting value to presentation
  static F = "Free";
  static P = "Paid";
  static O = "Open Source";

  constructor(value) {
    this.value = value;
    this.presentation = Price[value];
  }
}

export class Product {
  constructor(data) {
    this.pk = data.pk;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.website = data.website;
    this.price = new Price(data.price);
    this.images = data.images;
    this.category = data.category;
  }
}

export class ProductImage {
  constructor(data) {
    this.pk = data.pk;
    this.product = data.product;
    this.url = data.image;
  }
}

export class Products extends ListResponse {
  constructor(data) {
    super(data);

    this.results = data.results.map((result) => new Product(result));
  }
}

export class Vote {
  constructor(data) {
    this.id = data.pk;
    this.option = data.option;
    this.user = data.user;
    this.up = data.up;
    this.experience = data.experience;
    this.voteTime = new Date(data.vote_time);
  }
}

export class ObjectModel {
  static Question = "question";
  static Product = "product";
  static Option = "option";
  static Comment = "comment";
}

export class Report {
  constructor(data) {
    this.title = data.title;
    this.description = data.description;
    this.objectModel = data.object_model;
    this.objectId = data.object_pk;
    this.reporter = data.reporter;
    this.created = new Date(data.created);
  }
}

export class Category {
  constructor(data) {
    this.id = data.pk;
    this.name = data.name;
    this.parent = data.parent;
  }
}

export class Categories extends ListResponse {
  constructor(data) {
    super(data);

    this.results = data.results.map((result) => new Category(result));
  }
}
