import {T_Artifact} from "src/modules/types.ts";

export const ArtifactMocks:T_Artifact[] = [
      {
        id: 1,
        title: "Метро 2033",
        author: "Дмитрий Глуховский",
        description: "Постапокалиптический роман, породивший медиафраншизу и оказавший значительное влияние на современную русскую фантастику",
        publication_year: "2005",
        genre: "Постапокалиптическая фантастика",
        base_influence_score: 410,
        citation_count: 150,
        media_mentions: 95,
        social_media_score: 85,
        adaptation_count: 3,
        image: ""
    },
    {
        id: 2,
        title: "Игра престолов", 
        author: "Джордж Р.Р. Мартин",
        description: "Эпический фэнтези-сериал, ставший глобальным культурным феноменом и изменивший телевизионную индустрию",
        publication_year: "2011",
        genre: "Фэнтези, драма",
        base_influence_score: 920,
        citation_count: 320,
        media_mentions: 450,
        social_media_score: 380,
        adaptation_count: 1,
        image: "http://localhost:9000/images/got.png"
    },
    {
        id: 3,
        title: "Оно",
        author: "Стивен Кинг",
        description: "Культовый роман ужасов, образ Пеннивайза стал одним из самых узнаваемых в поп-культуре",
        publication_year: "1986",
        genre: "Хоррор",
        base_influence_score: 900,
        citation_count: 280,
        media_mentions: 320,
        social_media_score: 410,
        adaptation_count: 2,
        image: "http://localhost:9000/images/it.png"
    },
    {
        id: 4,
        title: "MrBeast",
        author: "Джимми Дональдсон", 
        description: "YouTube-создатель, изменивший подход к созданию контента и филантропии в цифровой среде",
        publication_year: "2012",
        genre: "Новые медиа",
        base_influence_score: 950,
        citation_count: 45,
        media_mentions: 280,
        social_media_score: 890,
        adaptation_count: 0,
        image: "http://localhost:9000/images/mrbeast.png"
    },
    {
        id: 5,
        title: "Comedy Club",
        author: "Гарик Мартиросян, Артур Джанибекян",
        description: "Юмористическое шоу, сформировавшее язык и юмор целого поколения в России",
        publication_year: "2005", 
        genre: "Юмористическое шоу",
        base_influence_score: 780,
        citation_count: 120,
        media_mentions: 310,
        social_media_score: 290,
        adaptation_count: 15,
        image: "http://localhost:9000/images/comedyclub.png"
    },
    {
        id: 6,
        title: "Офис (The Office)",
        author: "Грег Дэниелс",
        description: "Ситком, определивший формат мокьюментари и ставший источником бесчисленных мемов",
        publication_year: "2005",
        genre: "Ситком",
        base_influence_score: 890,
        citation_count: 210,
        media_mentions: 190,
        social_media_score: 670,
        adaptation_count: 8,
        image: "http://localhost:9000/images/office.png"
    }
]