import { Product, CartItem, LOCKED_PRICING } from '../types';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Real Madrid “BenQ Era” 2006-07 Away Kit",
    image: "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto/q_auto/product1.jpg"
  },

  {
    id: 2,
    name: "Real Madrid Emerald Third Kit 25/26",
    images: [
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto/q_auto/product2.1.jpg",
      "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto/q_auto/product2.2.jpg"
    ]
  },

  {
    id: 3,
    name: "Manchester United Retro Black Away 07/08 – AIG Era",
    image: "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto/q_auto/product3.jpg"
  },
  {
    id: 4,
    name: "Real Madrid Retro White Home – Teka Era",
    image: "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto/q_auto/product4.jpg"
  },
  {
    id: 5,
    name: "Real Madrid “White Crown” 25/26 Third Kit",
    image: "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto/q_auto/product5.jpg"
  },
  {
    id: 6,
    name: "FC Barcelona “Purple Haze” Special Edition",
    image: "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto/q_auto/product6.jpg"
  },
  {
    id: 7,
    name: "Manchester United “Moscow 2008” Final Kit",
    image: "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto/q_auto/product7.jpg"
  },
  {
    id: 8,
    name: "England “Beckham 7” 2002 World Cup Home Kit",
    image: "https://res.cloudinary.com/z7xfimgd/image/upload/f_auto/q_auto/product8.jpg"
  },

];


export const INITIAL_CART_ITEMS: CartItem[] = [];