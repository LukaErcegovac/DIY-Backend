export let users = [
  {
    userId: 0,
    email: "markof@gmail.com",
    name: "Marko Ferenci",
    password: "1234",
  },
  {
    userId: 1,
    email: "teof@gmail.com",
    name: "Teo Frankovci",
    password: "2345",
  },
  {
    userId: 2,
    email: "lorisg@gmail.com",
    name: "Loris Galic",
    password: "3456",
  },
];

export let data = [
  {
    id: 0,
    name: "Stol",
    postedBy: "Marko Ferenci",
    description: "Stol za terasu",
    likes: 25,
    comments: [
      {
        commentId: 0,
        comment: "Ok",
        commentedBy: "Teo Frankovci",
      },
      {
        commentId: 1,
        comment: "Super",
        commentedBy: "Loris Galic",
      },
    ],
  },
  {
    id: 1,
    name: "Stol",
    postedBy: "Teo Frankovci",
    description: "Stol za blagavaonu",
    likes: 54,
    comments: [
      {
        commentId: 2,
        comment: "Ok",
        commentedBy: "Marko Ferenci",
      },
      {
        commentId: 3,
        comment: "Super",
        commentedBy: "Loris Galic",
      },
    ],
  },
  {
    id: 2,
    name: "Stolac",
    postedBy: "Loris Galic",
    description: "Stolice za sjedenje",
    likes: 25,
    comments: [
      {
        commentId: 4,
        comment: "Ok",
        commentedBy: "Teo Frankovci",
      },
      {
        commentId: 5,
        comment: "Super",
        commentedBy: "Marko Ferenci",
      },
    ],
  },
];

export let objave = data.map((res) => {
  return {
    id: res.id,
    name: res.name,
    postedBy: res.postedBy,
  };
});

export let objaveDetails = data.map((res) => {
  return {
    id: res.id,
    name: res.name,
    postedBy: res.postedBy,
    description: res.description,
    likes: res.likes,
    comments: res.comments,
  };
});
