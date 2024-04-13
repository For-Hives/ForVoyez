# ForHives tech base stack - Template 🐝
A boiler plate with a complete stack : next, tailwind, bruno, renovate, husky, eslint, prettier, github ci, caprover, docker

#### _dev_
```
git clone
-> add .env file
-> add .env file in .bruno folder
// bruno can't access to the general .env file
npm install
npm run dev
npm run build
```

## Tech stack 💻
That is the list of technologies that ForHives use.

> **Front**
>
> > - [NextJs (ReactJS)](https://nextjs.org/)
> > - [TailwindCSS](https://tailwindcss.com/)
> > - [TailwindUI](https://tailwindui.com/)
> > - [HeadlessUI](https://headlessui.com/)
> > - [Prettier](https://prettier.io/)
> > - [EsLint](https://eslint.org/)
> > - [Husky](https://typicode.github.io/husky/#/)

> **CSS possibilities**
> > - [Next UI](https://nextui.org/) -> more speed, more efficient, if you don't want to build custom component, and just use a component library
> > - [Shadncn](https://ui.shadcn.com/) -> if you want to build custom component, and get much control
> > - [Catalyst](https://catalyst.tailwindui.com/docs) -> tailwindui components (official tailwind source)
> > - [DaisyUI](https://daisyui.com/) -> alternative to Next UI

> **CI/CD**
>
> > - GitHub CI
> > - [Renovate](https://www.mend.io/renovate/)

> **State management**
> > - [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)

> **API Call (postman alternative)**
> > - [Bruno](https://github.com/usebruno/bruno) (or postman // insomnia, bruno is usefull to build a versionning system about your api calls') 


## Todo list 📝
- [ ] Change the name of the project
- [ ] Change the name of the project in the package.json
- [ ] Change the name of the project in the README.md
- [ ] Follow the first guide for GitHub CI 
- [ ] Follow the second guide for CapRover install & config
- [ ] Change the app/layout.js
  - [ ] Change the font
  - [ ] Change the domain name
- [ ] Change the favicon
- [ ] Change the loader
- [ ] Change the font in the tailwind.config.js
- [ ] Change the font in styles/globals.css
- [ ] replace the url in the next.config.js
- [ ] replace the theme colors in tailwind.config.js
- [ ] configure your renovate bot in your github repo / account
- [ ] lets go to dev your project !

## Other options
- [ ] Add bruno if you need to call an API and you don't want to use postman (and share the confs)
- [ ] Add a state management if you need it (zustand is a good one)
- [ ] Add Auth if you need it (next-auth is a good one)
- [ ] Add a CMS if you need it (strapi/pocketbase are good ones)
- [ ] Add Zod if you need to control the form states more efficiently and take control about the call from an API


### Any real project example ??
> https://github.com/For-Hives/formenu  
> https://github.com/For-Hives/my-makeup
> https://github.com/CinquinAndy/mariage-mae
> https://github.com/CinquinAndy/PortefolioV6

