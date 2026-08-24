// Sitemap data structure used to build the sitemap HTML
export const sitemap = [
  { href: "/index.html", label: "/index" },
  {
    group: true,
    items: [
      { href: "/home.html", label: "/home" },
      { href: "/sobre.html", label: "/sobre" },
      {
        href: "/galeria/index.html",
        label: "/galeria",
        children: [
          {
            href: "/galeria/arte/index.html",
            label: "/arte",
            children: [
              { href: "/galeria/arte/sketchbook-2019.html", label: "/sketchbook-2019" },
              { href: "/galeria/arte/sketchbook-2022.html", label: "/sketchbook-2022" },
            ],
          },
          { href: "/galeria/fotografia/index.html", label: "/fotografia" },
          { href: "/galeria/cat.jpg/index.html", label: "/cat.jpg" },
        ],
      },
      {
        href: "/Save/index.html",
        label: "/save",
        children: [
          {
            href: "/Save/w.html",
            label: "/w",
            children: [
              { href: "/Save/w-lewd.html", label: "/w-lewd" },
              { href: "/Save/w-ultrawide.html", label: "/w-ultrawide" },
              { href: "/Save/w-vertical.html", label: "/w-vertical" },
            ],
          },
          { href: "/Save/pfp.html", label: "/pfp" },
          { href: "/Save/b.html", label: "/b" },
        ],
      },
      {
        items: [
          { href: "/2kki.html", label: "/2kki" },
          { href: "/mplace/index.html", label: "/mplace" },
        ],
      },
      {
        href: "/outros.html",
        label: "/outros",
        children: [
          { href: "/pensamentos/index.html", label: "/pensamentos" },
          { href: "/anotacoes.html", label: "/anotacoes" },
          { href: "/inventario.html", label: "/inventario" },
          { href: "/agora.html", label: "/agora" },
        ],
      },
      {
        href: "/utils.html",
        label: "/utils",
        children: [
          { href: "/links.html", label: "/links" },
          { href: "/kaomojis.html", label: "/kaomojis" },
          { href: "/avatar.html", label: "/avatar" },
        ],
      },
      // { href: "/doar.html", label: "/doar" }, // desativado - reativar removendo o comentário
      { href: "/changelog.html", label: "/changelog" },
      { href: "/not_found.html", label: "/404" },
    ],
  },
  { href: "https://neocities.org/site/mozartsempiano", label: "/neocities", external: true },
];

export default sitemap;