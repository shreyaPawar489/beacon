import type { Report } from "./types";

// 30 mock reports around UC Berkeley.
// Matched pairs: mg_doe_hoodie (r_001 maya + r_002 priya, stalking), mg_calbro (r_003 + r_004 maya, online @calbro_mike).
export const MOCK_REPORTS: Report[] = [
  {
    "id": "r_009",
    "user_alias": "anon_sofia",
    "datetime": "2026-09-23T06:45:00.000Z",
    "location": {
      "lat": 37.863828,
      "lng": -122.256291,
      "label": "Southside \u2013 Dwight Way & Bowditch St"
    },
    "category": "assault",
    "offender_desc": "Man, ~30s, grey hoodie, black backpack, ~5'10\"",
    "severity": 4,
    "summary": "Pushed me against a wall and groped me before I got away.",
    "hash": "8259c5b9220116869eda18eb72d434d248d103bbe3f4d3d96a7881a1ba41645d",
    "created_at": "2026-09-23T15:45:00.000Z"
  },
  {
    "id": "r_004",
    "user_alias": "maya",
    "datetime": "2026-09-21T05:05:00.000Z",
    "location": {
      "lat": 37.867546,
      "lng": -122.258794,
      "label": "Telegraph Ave & Durant Ave"
    },
    "category": "online",
    "offender_desc": "Instagram user, profile pic at Memorial Stadium",
    "severity": 3,
    "summary": "Kept DMing from new accounts after I blocked him, mentioned where I live.",
    "offender_handle": "@calbro_mike",
    "hash": "0c9deaab600cde2995416f7e9b49cf8564fcc704fe8109f61781b4712cd970df",
    "created_at": "2026-09-21T22:05:00.000Z",
    "match_group_id": "mg_calbro"
  },
  {
    "id": "r_015",
    "user_alias": "priya",
    "datetime": "2026-09-20T06:00:00.000Z",
    "location": {
      "lat": 37.863682,
      "lng": -122.256326,
      "label": "Southside \u2013 Dwight Way & Bowditch St"
    },
    "category": "assault",
    "offender_desc": "Young man, glasses, navy windbreaker",
    "severity": 4,
    "summary": "Grabbed me from behind in a crowd and ran off.",
    "hash": "398cbb89d4d4f8351d6ef0db77511f45a7ee714694a53cf98fdd079757355e4f",
    "created_at": "2026-09-21T03:00:00.000Z"
  },
  {
    "id": "r_007",
    "user_alias": "anon_lena",
    "datetime": "2026-09-20T04:45:00.000Z",
    "location": {
      "lat": 37.86796,
      "lng": -122.25878,
      "label": "Telegraph Ave & Durant Ave"
    },
    "category": "online",
    "offender_desc": "Tall man, beard, red cap, carrying skateboard",
    "severity": 3,
    "summary": "Received threatening DMs after declining to go out.",
    "offender_handle": "@dk_bears22",
    "hash": "816b36a4c2fe08402b1def2337712b35bda62cefb50d2c231453de0411b98511",
    "created_at": "2026-09-20T08:45:00.000Z"
  },
  {
    "id": "r_002",
    "user_alias": "priya",
    "datetime": "2026-09-19T21:45:00.000Z",
    "location": {
      "lat": 37.870421,
      "lng": -122.259742,
      "label": "Sather Gate"
    },
    "category": "stalking",
    "offender_desc": "Guy in grey hoodie with black backpack, maybe 30, average height",
    "severity": 4,
    "summary": "Walked behind me from Sather Gate toward Telegraph and waited outside the store I ducked into.",
    "hash": "3542d60f7b908dcd19ad832dc08a2d8a58a4eccd0da2e5b7a24d1b1f90c5902c",
    "created_at": "2026-09-20T02:45:00.000Z",
    "match_group_id": "mg_doe_hoodie"
  },
  {
    "id": "r_022",
    "user_alias": "anon_ruby",
    "datetime": "2026-09-19T06:45:00.000Z",
    "location": {
      "lat": 37.870021,
      "lng": -122.259392,
      "label": "Sather Gate"
    },
    "category": "stalking",
    "offender_desc": "Two men, one in a leather jacket",
    "severity": 3,
    "summary": "Followed me from the library to the bus stop, kept the same distance.",
    "hash": "f42f0fe2504b927aaad3307f1572a0f690e6c058aa0cf938159ee5eb61168c27",
    "created_at": "2026-09-19T23:45:00.000Z"
  },
  {
    "id": "r_006",
    "user_alias": "anon_lena",
    "datetime": "2026-09-18T03:45:00.000Z",
    "location": {
      "lat": 37.867578,
      "lng": -122.25863,
      "label": "Telegraph Ave & Durant Ave"
    },
    "category": "stalking",
    "offender_desc": "Man ~20s, white sneakers, blue Cal sweatshirt",
    "severity": 3,
    "summary": "Same man has waited outside my building two nights this week.",
    "hash": "d91b3eb3ab469314b25c4772e859af6ce6cb4cb3cafd7b031faefd2b70f15c09",
    "created_at": "2026-09-18T11:45:00.000Z"
  },
  {
    "id": "r_011",
    "user_alias": "anon_ruby",
    "datetime": "2026-09-15T17:15:00.000Z",
    "location": {
      "lat": 37.866541,
      "lng": -122.258914,
      "label": "Telegraph Ave & Channing Way"
    },
    "category": "harassment",
    "offender_desc": "Tall man, beard, red cap, carrying skateboard",
    "severity": 3,
    "summary": "Made repeated sexual comments as I walked past and followed for half a block.",
    "hash": "5235dca0748b1769cedea0cfa62ca5f7bc0876e86bdefa02951330d1bf73a332",
    "created_at": "2026-09-15T23:15:00.000Z"
  },
  {
    "id": "r_001",
    "user_alias": "maya",
    "datetime": "2026-09-14T22:10:00.000Z",
    "location": {
      "lat": 37.872059,
      "lng": -122.259779,
      "label": "Doe Library"
    },
    "category": "stalking",
    "offender_desc": "Man, ~30s, grey hoodie, black backpack, ~5'10\"",
    "severity": 4,
    "summary": "Followed me from Doe Library down to Bancroft, stopped whenever I stopped.",
    "hash": "882b4afcd7b4c6d97211cff91e721fa1da1c4009c980883b0660280fa6a63243",
    "created_at": "2026-09-15T18:10:00.000Z",
    "match_group_id": "mg_doe_hoodie"
  },
  {
    "id": "r_018",
    "user_alias": "anon_noor",
    "datetime": "2026-09-09T04:45:00.000Z",
    "location": {
      "lat": 37.86537,
      "lng": -122.257014,
      "label": "People's Park"
    },
    "category": "assault",
    "offender_desc": "Tall man, beard, red cap, carrying skateboard",
    "severity": 5,
    "summary": "Grabbed me from behind in a crowd and ran off.",
    "hash": "e9e273c9437cba4f3e5fc12ea69d14a8e504b8e7c6781451b76c005530796285",
    "created_at": "2026-09-10T05:45:00.000Z"
  },
  {
    "id": "r_017",
    "user_alias": "anon_noor",
    "datetime": "2026-09-08T19:15:00.000Z",
    "location": {
      "lat": 37.870485,
      "lng": -122.259008,
      "label": "Sather Gate"
    },
    "category": "assault",
    "offender_desc": "Man ~20s, white sneakers, blue Cal sweatshirt",
    "severity": 4,
    "summary": "Pushed me against a wall and groped me before I got away.",
    "hash": "85d6b0873d592f87edd8fed8430e1adda02b4e17903e5477410d3a09595dfd5e",
    "created_at": "2026-09-09T12:15:00.000Z"
  },
  {
    "id": "r_025",
    "user_alias": "priya",
    "datetime": "2026-09-07T22:45:00.000Z",
    "location": {
      "lat": 37.870054,
      "lng": -122.268442,
      "label": "Downtown Berkeley BART"
    },
    "category": "online",
    "offender_desc": "Tall man, beard, red cap, carrying skateboard",
    "severity": 3,
    "summary": "Account keeps creating new profiles to message me after being blocked.",
    "offender_handle": "@night.owl.510",
    "hash": "b6812a2067b43264d166265f8c7c642839e0308896db023368fb13c1eb46efa1",
    "created_at": "2026-09-08T07:45:00.000Z"
  },
  {
    "id": "r_029",
    "user_alias": "anon_ruby",
    "datetime": "2026-09-05T17:45:00.000Z",
    "location": {
      "lat": 37.870616,
      "lng": -122.259585,
      "label": "Sather Gate"
    },
    "category": "assault",
    "offender_desc": "Man, ~30s, grey hoodie, black backpack, ~5'10\"",
    "severity": 4,
    "summary": "Pushed me against a wall and groped me before I got away.",
    "hash": "1957027ff413bd3f661161ba1fdf288d4e88e1eee5c2f8bba9ece1481cc2f3e9",
    "created_at": "2026-09-06T02:45:00.000Z"
  },
  {
    "id": "r_030",
    "user_alias": "anon_jade",
    "datetime": "2026-09-03T23:00:00.000Z",
    "location": {
      "lat": 37.872134,
      "lng": -122.259168,
      "label": "Doe Library"
    },
    "category": "harassment",
    "offender_desc": "Man, ~30s, grey hoodie, black backpack, ~5'10\"",
    "severity": 3,
    "summary": "Catcalled and tried to grab my arm outside a caf\u00e9.",
    "hash": "ee6ff5cdbf7583ebf47f1621be15bf12453ec79f2fde8adfa50acdd4069624f7",
    "created_at": "2026-09-04T01:00:00.000Z"
  },
  {
    "id": "r_026",
    "user_alias": "anon_lena",
    "datetime": "2026-09-03T04:00:00.000Z",
    "location": {
      "lat": 37.866562,
      "lng": -122.255081,
      "label": "Southside \u2013 Unit 2 dorms, Haste St"
    },
    "category": "stalking",
    "offender_desc": "Older man, long grey hair, army jacket",
    "severity": 4,
    "summary": "Followed me from the library to the bus stop, kept the same distance.",
    "hash": "38c2263e604d210fce0aa4dbce677435af069c04aeaec93a8a7d6936748bb9b0",
    "created_at": "2026-09-03T16:00:00.000Z"
  },
  {
    "id": "r_003",
    "user_alias": "anon_lena",
    "datetime": "2026-09-02T03:20:00.000Z",
    "location": {
      "lat": 37.868829,
      "lng": -122.259007,
      "label": "Bancroft Way & Telegraph Ave"
    },
    "category": "online",
    "offender_desc": "Instagram account, says he's a Cal student",
    "severity": 3,
    "summary": "Sent repeated messages and explicit images after I declined to meet up.",
    "offender_handle": "@calbro_mike",
    "hash": "72e4f88b25b8e66cf7d1c30a2155610326de04ca06d891643d7665697b114312",
    "created_at": "2026-09-02T05:20:00.000Z",
    "match_group_id": "mg_calbro"
  },
  {
    "id": "r_019",
    "user_alias": "anon_jade",
    "datetime": "2026-09-01T18:00:00.000Z",
    "location": {
      "lat": 37.869041,
      "lng": -122.258523,
      "label": "Bancroft Way & Telegraph Ave"
    },
    "category": "online",
    "offender_desc": "Older man, long grey hair, army jacket",
    "severity": 2,
    "summary": "Received threatening DMs after declining to go out.",
    "offender_handle": "@sunset_jt",
    "hash": "dd491a91f33aa10a432d93b2e34bd45362d44f08a795b901c4d146608773b4ee",
    "created_at": "2026-09-02T01:00:00.000Z"
  },
  {
    "id": "r_016",
    "user_alias": "priya",
    "datetime": "2026-08-27T22:00:00.000Z",
    "location": {
      "lat": 37.865515,
      "lng": -122.256673,
      "label": "People's Park"
    },
    "category": "assault",
    "offender_desc": "Unknown \u2013 couldn't see face",
    "severity": 4,
    "summary": "Pushed me against a wall and groped me before I got away.",
    "hash": "7e9c92076f05301742faf5c02a7be46dee840c7803004fe6bb93650dd7a9f4b5",
    "created_at": "2026-08-28T08:00:00.000Z"
  },
  {
    "id": "r_013",
    "user_alias": "anon_ava",
    "datetime": "2026-08-22T22:45:00.000Z",
    "location": {
      "lat": 37.871952,
      "lng": -122.259112,
      "label": "Doe Library"
    },
    "category": "online",
    "offender_desc": "Older man, long grey hair, army jacket",
    "severity": 2,
    "summary": "Received threatening DMs after declining to go out.",
    "offender_handle": "@sunset_jt",
    "hash": "2bc5de158ec7f3099bc2aac3c1fd6797653f280f0bdf73258538e6c2a7f262c7",
    "created_at": "2026-08-24T04:45:00.000Z"
  },
  {
    "id": "r_027",
    "user_alias": "anon_jade",
    "datetime": "2026-08-22T04:45:00.000Z",
    "location": {
      "lat": 37.866978,
      "lng": -122.259084,
      "label": "Telegraph Ave & Channing Way"
    },
    "category": "unsafe_area",
    "offender_desc": "N/A \u2013 environmental",
    "severity": 1,
    "summary": "Streetlight out for weeks, very dark walking home.",
    "hash": "32c52fbf406446c155344b975ac22303b4db6d9b0f824a5520e600d496e74b52",
    "created_at": "2026-08-23T06:45:00.000Z"
  },
  {
    "id": "r_021",
    "user_alias": "anon_lena",
    "datetime": "2026-08-18T19:00:00.000Z",
    "location": {
      "lat": 37.866601,
      "lng": -122.258866,
      "label": "Telegraph Ave & Channing Way"
    },
    "category": "assault",
    "offender_desc": "Two men, one in a leather jacket",
    "severity": 4,
    "summary": "Grabbed me from behind in a crowd and ran off.",
    "hash": "c181e03e4bd2b09c31917c97b2581215bedfa429667979c36f016516d6c31266",
    "created_at": "2026-08-19T10:00:00.000Z"
  },
  {
    "id": "r_024",
    "user_alias": "priya",
    "datetime": "2026-08-18T01:15:00.000Z",
    "location": {
      "lat": 37.86626,
      "lng": -122.260721,
      "label": "Channing Way & Ellsworth St"
    },
    "category": "harassment",
    "offender_desc": "Two men, one in a leather jacket",
    "severity": 2,
    "summary": "Yelled at me and a friend, blocked the sidewalk when we tried to pass.",
    "hash": "e4d1d178d3bc615522c00bfdee071333934e7bd7852d2ff9b092ccb4a96d3528",
    "created_at": "2026-08-18T07:15:00.000Z"
  },
  {
    "id": "r_012",
    "user_alias": "anon_jade",
    "datetime": "2026-08-16T20:30:00.000Z",
    "location": {
      "lat": 37.868052,
      "lng": -122.258788,
      "label": "Telegraph Ave & Durant Ave"
    },
    "category": "stalking",
    "offender_desc": "Man ~20s, white sneakers, blue Cal sweatshirt",
    "severity": 3,
    "summary": "Noticed the same person behind me for three blocks after leaving class.",
    "hash": "764f980b999e2d609e75f7197b6fb64342c894255d8e2d384a36f86a129986d2",
    "created_at": "2026-08-17T03:30:00.000Z"
  },
  {
    "id": "r_028",
    "user_alias": "anon_sofia",
    "datetime": "2026-08-15T22:45:00.000Z",
    "location": {
      "lat": 37.865132,
      "lng": -122.256777,
      "label": "People's Park"
    },
    "category": "online",
    "offender_desc": "Man, ~30s, grey hoodie, black backpack, ~5'10\"",
    "severity": 2,
    "summary": "Account keeps creating new profiles to message me after being blocked.",
    "offender_handle": "@dk_bears22",
    "hash": "bcf966284b4f82803a2e424d9d1c214e368d6f49169ee7e8c0cb8ca6e2b95bf7",
    "created_at": "2026-08-15T23:45:00.000Z"
  },
  {
    "id": "r_010",
    "user_alias": "anon_lena",
    "datetime": "2026-08-15T06:00:00.000Z",
    "location": {
      "lat": 37.867813,
      "lng": -122.258503,
      "label": "Telegraph Ave & Durant Ave"
    },
    "category": "assault",
    "offender_desc": "Unknown \u2013 couldn't see face",
    "severity": 5,
    "summary": "Pushed me against a wall and groped me before I got away.",
    "hash": "f403c1be98bc3940b5424e63cd2d49d3f6024550cb7b520903c18517d35b19ef",
    "created_at": "2026-08-15T08:00:00.000Z"
  },
  {
    "id": "r_008",
    "user_alias": "maya",
    "datetime": "2026-08-15T05:00:00.000Z",
    "location": {
      "lat": 37.872912,
      "lng": -122.259042,
      "label": "Memorial Glade"
    },
    "category": "assault",
    "offender_desc": "Older man, long grey hair, army jacket",
    "severity": 5,
    "summary": "Grabbed me from behind in a crowd and ran off.",
    "hash": "6f5f68fe2144b95d7818759bc6af3d6bc9d5b6d0bae00c9c16cb96ca6f06021c",
    "created_at": "2026-08-15T11:00:00.000Z"
  },
  {
    "id": "r_005",
    "user_alias": "maya",
    "datetime": "2026-08-14T17:15:00.000Z",
    "location": {
      "lat": 37.865968,
      "lng": -122.25886,
      "label": "Telegraph Ave & Haste St"
    },
    "category": "harassment",
    "offender_desc": "Unknown \u2013 couldn't see face",
    "severity": 2,
    "summary": "Catcalled and tried to grab my arm outside a caf\u00e9.",
    "hash": "2f7e2cbc7f6e696b2c5546b2f6e4359ede61e60ab606ecb6e6be4a0c5fac81e9",
    "created_at": "2026-08-15T16:15:00.000Z"
  },
  {
    "id": "r_020",
    "user_alias": "anon_ruby",
    "datetime": "2026-08-13T22:15:00.000Z",
    "location": {
      "lat": 37.865761,
      "lng": -122.256616,
      "label": "People's Park"
    },
    "category": "unsafe_area",
    "offender_desc": "N/A \u2013 environmental",
    "severity": 1,
    "summary": "No lighting on this path, felt unsafe walking alone.",
    "hash": "2bf4c98e3c43e813bdca34dd8125979d5f6c97df5fdf41f07ba09e321de8dc58",
    "created_at": "2026-08-14T08:15:00.000Z"
  },
  {
    "id": "r_023",
    "user_alias": "anon_jade",
    "datetime": "2026-08-06T20:15:00.000Z",
    "location": {
      "lat": 37.870315,
      "lng": -122.259356,
      "label": "Sather Gate"
    },
    "category": "unsafe_area",
    "offender_desc": "N/A \u2013 environmental",
    "severity": 1,
    "summary": "No lighting on this path, felt unsafe walking alone.",
    "hash": "055fcc8672d59cfcab31fa76fddee4da913f7ff4298ba3f64eea34abdea6479e",
    "created_at": "2026-08-07T18:15:00.000Z"
  },
  {
    "id": "r_014",
    "user_alias": "priya",
    "datetime": "2026-08-04T06:00:00.000Z",
    "location": {
      "lat": 37.866891,
      "lng": -122.258981,
      "label": "Telegraph Ave & Channing Way"
    },
    "category": "unsafe_area",
    "offender_desc": "N/A \u2013 environmental",
    "severity": 2,
    "summary": "Streetlight out for weeks, very dark walking home.",
    "hash": "da84d3f023ff9c99a039a6acc356bf99ba6b1505a436f1063bfe622374d59330",
    "created_at": "2026-08-04T16:00:00.000Z"
  }
];

export function mockReportsForUser(user: string): Report[] {
  return MOCK_REPORTS.filter((r) => r.user_alias === user);
}

export function mockReportsForGroup(groupId: string): Report[] {
  return MOCK_REPORTS.filter((r) => r.match_group_id === groupId);
}
