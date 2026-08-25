// Sitemap data structure used to build the sitemap HTML
export const sitemap = [
  { href: "/", label: "/index" },
  {
    group: true,
    items: [
      { href: "/home/", label: "/home" },
      { href: "/sobre/", label: "/sobre" },
      {
        href: "/galeria/",
        label: "/galeria",
        children: [
          {
            href: "/galeria/arte/",
            label: "/arte",
            children: [
              { href: "/galeria/arte/sketchbook-2019/", label: "/sketchbook-2019" },
              { href: "/galeria/arte/sketchbook-2022/", label: "/sketchbook-2022" },
            ],
          },
          { href: "/galeria/fotografia/", label: "/fotografia" },
          { href: "/galeria/cat.jpg/", label: "/cat.jpg" },
        ],
      },
      {
        href: "/Save/",
        label: "/save",
        children: [
          {
            href: "/Save/w/",
            label: "/w",
            children: [
              { href: "/Save/w-lewd/", label: "/w-lewd" },
              { href: "/Save/w-ultrawide/", label: "/w-ultrawide" },
              { href: "/Save/w-vertical/", label: "/w-vertical" },
            ],
          },
          { href: "/Save/pfp/", label: "/pfp" },
          { href: "/Save/b/", label: "/b" },
        ],
      },
      {
        items: [
          { href: "/2kki/", label: "/2kki" },
          { href: "/mplace/", label: "/mplace" },
        ],
      },
      {
        href: "/outros/",
        label: "/outros",
        children: [
          { href: "/pensamentos/", label: "/pensamentos" },
          { href: "/anotacoes/", label: "/anotacoes" },
          { href: "/inventario/", label: "/inventario" },
          { href: "/agora/", label: "/agora" },
          { href: "/contato/", label: "/contato" },
        ],
      },
      {
        href: "/utils/",
        label: "/utils",
        children: [
          { href: "/links/", label: "/links" },
          { href: "/kaomojis/", label: "/kaomojis" },
          { href: "/avatar/", label: "/avatar" },
        ],
      },
      // { href: "/doar/", label: "/doar" }, // desativado - reativar removendo o comentário
      { href: "/changelog/", label: "/changelog" },
      { href: "/not_found/", label: "/404" },
    ],
  },
  { href: "https://neocities.org/site/mozartsempiano", label: "/neocities", external: true },
];

export default sitemap;