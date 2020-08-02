#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use] extern crate rocket;
use maud::{html, Markup};


// #[get("/")]
// fn index() -> &'static str {
//     "Hello, world!"
// }

/// This is the entrypoint for our yew client side app.
#[get("/")]
fn index() -> &'static str {
    // maud macro
    html! {
        //link rel="stylesheet" href="static/styles.css" {}
        body {}
        // yew-generated javascript attaches to <body>
        script src=("static/index.js") {}
    }
}

fn main() {
    rocket::ignite().mount("/", routes![index]).launch();
}