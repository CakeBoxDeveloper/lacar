import glob, re

# Координаты городов
COORDS = {
    'Київ':    (50.4501, 30.5234),
    'Варшава': (52.2297, 21.0122),
    'Краків':  (50.0647, 19.9450),
    'Бухарест':(44.4268, 26.1025),
    'Кишинів': (47.0105, 28.8638),
    'Одеса':   (46.4825, 30.7233),
    'Берлін':  (52.5200, 13.4050),
    'Софія':   (42.6977, 23.3219),
    'Львів':   (49.8397, 24.0297),
    'Вроцлав': (51.1079, 17.0385),
    'Гданськ': (54.3520, 18.6466),
}

ROUTES = {
    'kyiv-warsaw':    ('Київ', 'Варшава'),
    'kyiv-krakow':    ('Київ', 'Краків'),
    'kyiv-bucharest': ('Київ', 'Бухарест'),
    'kyiv-chisinau':  ('Київ', 'Кишинів'),
    'odesa-warsaw':   ('Одеса', 'Варшава'),
    'kyiv-sofia':     ('Київ', 'Софія'),
    'lviv-warsaw':    ('Львів', 'Варшава'),
    'kyiv-wroclaw':   ('Київ', 'Вроцлав'),
    'kyiv-gdansk':    ('Київ', 'Гданськ'),
    'kyiv-berlin':    ('Київ', 'Берлін'),
    'odesa-chisinau': ('Одеса', 'Кишинів'),
}

MAP_TEMPLATE = '''<section class="route-map">
  <div class="container">
    <div id="routeMap" class="route-map__leaflet"></div>
  </div>
</section>
<script>
(function(){{
  if(typeof L==='undefined') return;
  var map = L.map('routeMap',{{zoomControl:true,scrollWheelZoom:false}});
  L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png',{{
    attribution:'© OpenStreetMap',maxZoom:18
  }}).addTo(map);
  var from=[{from_lat},{from_lng}],to=[{to_lat},{to_lng}];
  // Fetch route from OSRM
  fetch('https://router.project-osrm.org/route/v1/driving/{from_lng},{from_lat};{to_lng},{to_lat}?overview=full&geometries=geojson')
    .then(r=>r.json()).then(data=>{{
      if(!data.routes||!data.routes[0]) return;
      var coords=data.routes[0].geometry.coordinates.map(function(c){{return[c[1],c[0]];}});
      L.polyline(coords,{{color:'#e8c56c',weight:4,opacity:0.9}}).addTo(map);
      var bounds=L.latLngBounds(coords);
      map.fitBounds(bounds,{{padding:[20,20]}});
      L.circleMarker(from,{{radius:8,fillColor:'#e8c56c',color:'#fff',weight:2,fillOpacity:1}}).addTo(map).bindPopup('{from_city}').openPopup();
      L.circleMarker(to,{{radius:8,fillColor:'#e8c56c',color:'#fff',weight:2,fillOpacity:1}}).addTo(map).bindPopup('{to_city}');
    }}).catch(function(){{
      map.setView([(from[0]+to[0])/2,(from[1]+to[1])/2],5);
    }});
}})();
</script>'''

LEAFLET_HEAD = '''  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN/WLI=" crossorigin=""></script>'''

for path in glob.glob('routes/*.html'):
    slug = path.replace('routes\\','').replace('routes/','').replace('.html','')
    if slug not in ROUTES:
        continue

    from_city, to_city = ROUTES[slug]
    fc, fl = COORDS[from_city]
    tc, tl = COORDS[to_city]

    text = open(path, encoding='utf-8').read()
    original = text

    # Add Leaflet to head if not present
    if 'leaflet' not in text:
        text = text.replace('</head>', LEAFLET_HEAD + '\n</head>', 1)

    # Replace old iframe map with Leaflet div
    new_map = MAP_TEMPLATE.format(
        from_lat=fc, from_lng=fl,
        to_lat=tc, to_lng=tl,
        from_city=from_city, to_city=to_city
    )
    text = re.sub(r'<section class="route-map">.*?</section>', new_map, text, flags=re.DOTALL)

    if text != original:
        open(path, 'w', encoding='utf-8').write(text)
        print(f'Fixed: {path}')
    else:
        print(f'No change: {path}')

print('Done')
