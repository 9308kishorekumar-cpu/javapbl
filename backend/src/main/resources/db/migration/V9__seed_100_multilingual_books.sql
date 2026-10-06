-- Flyway V9: Seed 100+ Multilingual Books Across Global Literatures, Sciences & Philosophy (Robust Subqueries)

-- 1. Insert Additional Categories (if not exist)
INSERT INTO categories (name, description)
SELECT 'Literature & Fiction', 'World classics, contemporary fiction, and narrative prose'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Literature & Fiction');

INSERT INTO categories (name, description)
SELECT 'Physics & Astronomy', 'Cosmology, astrophysics, theoretical physics and quantum mechanics'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Physics & Astronomy');

INSERT INTO categories (name, description)
SELECT 'History & Civilizations', 'Ancient epics, historiography, and cultural chronicles'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'History & Civilizations');

INSERT INTO categories (name, description)
SELECT 'Psychology & Neuroscience', 'Cognitive psychology, behavioral science, and mental models'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Psychology & Neuroscience');

INSERT INTO categories (name, description)
SELECT 'Economics & Strategy', 'Economic theory, behavioral finance, and strategic treatises'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Economics & Strategy');

INSERT INTO categories (name, description)
SELECT 'Drama & Poetry', 'Classical theatre, poetic verses, and lyrical epics'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Drama & Poetry');

-- 2. Insert Global Authors
INSERT INTO authors (name, biography) VALUES
('Tiruvalluvar (திருவள்ளுவர்)', 'Ancient Tamil philosopher and poet, revered author of the Tirukkural.'),
('Kalki Krishnamurthy (கல்கி)', 'Renowned Tamil historical novelist, creator of Ponniyin Selvan and Sivagamiyin Sabatham.'),
('Ilango Adigal (இளங்கோ அடிகள்)', 'Chera prince and poet, author of the ancient Tamil epic Silappathikaram.'),
('Subramania Bharati (பாரதியார்)', 'Mahakavi of Tamil renaissance, patriotic poet and reformer.'),
('Jayakanthan (ஜெயகாந்தன்)', 'Sahitya Akademi and Jnanpith winning Tamil literary realist.'),
('Thirikooda Rasappa Kavirayar (திரிகூடராசப்பக் கவிராயர்)', 'Classical Tamil poet of Courtallam nature verses.'),
('Munshi Premchand (मुंशी प्रेमचंद)', 'Pioneer of modern Hindi and Urdu social literature, author of Godan and Gaban.'),
('Ramdhari Singh Dinkar (रामधारी सिंह दिनकर)', 'Rashtrakavi of Hindi literature, composer of Rashmirathi.'),
('Harivansh Rai Bachchan (हरिवंश राय बच्चन)', 'Celebrated Hindi poet of the Chhayavad movement, author of Madhushala.'),
('Jaishankar Prasad (जयशंकर प्रसाद)', 'Master of modern Hindi literature and dramatist, creator of Kamayani.'),
('Bhisham Sahni (भीष्म साहनी)', 'Acclaimed Hindi writer and playwright, author of Tamas.'),
('Phanishwar Nath Renu (फणीश्वर नाथ रेणु)', 'Pioneer of regional modern Hindi literature, creator of Maila Anchal.'),
('Agyeya (सच्चिदानंद हीरानंद वात्स्यायन ''अज्ञेय'')', 'Pioneering Hindi modernist poet, novelist and critic.'),
('Maharshi Vedavyasa (महर्षि वेदव्यास)', 'Ancient sage and composer of the Mahabharata and Bhagavad Gita.'),
('Mahakavi Kalidasa (कालिदास)', 'Greatest classical Sanskrit dramatist and poet, author of Shakuntala and Meghadutam.'),
('Vishnu Sharma (विष्णु शर्मा)', 'Ancient Indian scholar and author of the Panchatantra political fables.'),
('Chanakya / Kautilya (चाणक्य)', 'Ancient Indian philosopher, economist, jurist and author of the Arthashastra.'),
('Gabriel García Márquez', 'Nobel laureate in Literature, pioneer of magical realism and author of One Hundred Years of Solitude.'),
('Miguel de Cervantes', 'Spanish golden age novelist and author of Don Quijote de la Mancha.'),
('Jorge Luis Borges', 'Argentine essayist, poet, and master of philosophical labyrinths.'),
('Pablo Neruda', 'Nobel laureate Chilean poet and diplomat, author of Twenty Love Poems.'),
('Carlos Ruiz Zafón', 'Spanish novelist, author of The Shadow of the Wind and Cemetery of Forgotten Books.'),
('Julio Cortázar', 'Argentine-French novelist and master of short fiction, author of Rayuela.'),
('Antoine de Saint-Exupéry', 'French aviator and writer, author of Le Petit Prince.'),
('Albert Camus', 'Nobel laureate French philosopher, pioneer of absurdism and author of L''Étranger.'),
('Victor Hugo', 'French Romantic poet, dramatist, and author of Les Misérables and The Hunchback of Notre-Dame.'),
('Marcel Proust', 'French modernist author of In Search of Lost Time.'),
('Gustave Flaubert', 'French literary master of realism, author of Madame Bovary.'),
('Alexandre Dumas', 'French historical adventure novelist, creator of The Count of Monte Cristo.'),
('Voltaire', 'French Enlightenment writer, philosopher and satirist, author of Candide.'),
('Johann Wolfgang von Goethe', 'German polymath, poet, dramatist, and author of Faust.'),
('Franz Kafka', 'Bohemian German-language novelist of alienation and existential bureaucracy.'),
('Friedrich Nietzsche', 'German cultural critic, philologist, and philosopher of eternal recurrence.'),
('Hermann Hesse', 'Nobel laureate German-Swiss poet and novelist, author of Steppenwolf and Siddhartha.'),
('Immanuel Kant', 'German Enlightenment philosopher, author of Critique of Pure Reason.'),
('Günter Grass', 'Nobel laureate German novelist and artist, creator of The Tin Drum.'),
('Haruki Murakami (村上春樹)', 'Acclaimed contemporary Japanese surrealist novelist, author of Norwegian Wood and Kafka on the Shore.'),
('Osamu Dazai (太宰治)', 'Prominent 20th-century Japanese novelist, author of No Longer Human.'),
('Natsume Sōseki (夏目漱石)', 'Foremost novelist of the Meiji era in Japan, creator of Kokoro.'),
('Murasaki Shikibu (紫式部)', 'Heian period Japanese noblewoman and court lady, author of The Tale of Genji.'),
('Yasunari Kawabata (川端康成)', 'First Japanese Nobel laureate in Literature, author of Snow Country.'),
('Yukio Mishima (三島由紀夫)', 'Celebrated Japanese author, playwright and essayist, creator of The Temple of the Golden Pavilion.'),
('Leo Tolstoy (Лев Толстой)', 'Russian literary master, author of War and Peace and Anna Karenina.'),
('Fyodor Dostoevsky (Фёдор Достоевский)', 'Russian novelist of human psychology, guilt, and redemption, author of Crime and Punishment.'),
('Mikhail Bulgakov (Михаил Булгаков)', 'Russian dramatist and satirist, creator of The Master and Margarita.'),
('Alexander Pushkin (Александр Пушкин)', 'Father of modern Russian literature, author of Eugene Onegin.'),
('Ivan Turgenev (Иван Тургенев)', 'Russian novelist, poet, and dramatist, author of Fathers and Sons.'),
('Liu Cixin (刘慈欣)', 'China''s preeminent hard science fiction visionary, creator of The Three-Body Problem.'),
('Sun Tzu (孙武)', 'Ancient Chinese military general, strategist, and philosopher, author of The Art of War.'),
('Laozi (老子)', 'Ancient Chinese philosopher and founder of philosophical Taoism, author of Tao Te Ching.'),
('Cao Xueqin (曹雪芹)', 'Qing dynasty Chinese novelist, author of Dream of the Red Chamber.'),
('Wu Cheng''en (吴承恩)', 'Ming dynasty Chinese novelist, author of Journey to the West.'),
('Luo Guanzhong (罗贯中)', 'Yuan and Ming dynasty historical novelist, author of Romance of the Three Kingdoms.'),
('Shi Nai''an (施耐庵)', 'Yuan and Ming dynasty author of the classic Water Margin.'),
('Naguib Mahfouz (نجيب محفوظ)', 'Nobel laureate Egyptian author, chronicler of Cairo and modern Arabic literature.'),
('Ibn Khaldun (ابن خلدون)', 'Arab polymath, historian, and founder of modern historiography and sociology.'),
('Kahlil Gibran (جبران خليل جبران)', 'Lebanese-American poet, philosopher, and artist, author of The Prophet.'),
('Dante Alighieri', 'Florentine poet of the late Middle Ages, author of the Divine Comedy.'),
('Niccolò Machiavelli', 'Florentine diplomat, historian, and philosopher, author of The Prince.'),
('Giovanni Boccaccio', 'Florentine humanist and Renaissance author of The Decameron.'),
('Umberto Eco', 'Italian medievalist scholar, semiotician and novelist, author of The Name of the Rose.'),
('Marcus Aurelius', 'Roman Emperor and Stoic philosopher, author of Meditations.'),
('Plato', 'Classical Greek philosopher, founder of the Academy in Athens.'),
('Homer', 'Ancient legendary Greek poet, composer of the Iliad and the Odyssey.'),
('Robert C. Martin', 'Software craftsman, speaker, and author of Clean Code and Clean Architecture.'),
('Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 'The Gang of Four, authors of seminal Design Patterns.'),
('Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', 'Authors of Introduction to Algorithms (CLRS), the standard algorithms textbook.'),
('Harold Abelson, Gerald Jay Sussman', 'MIT professors and creators of Structure and Interpretation of Computer Programs (SICP).'),
('Ian Goodfellow, Yoshua Bengio, Aaron Courville', 'AI researchers and authors of Deep Learning.'),
('Martin Kleppmann', 'Distributed systems researcher and author of Designing Data-Intensive Applications.'),
('Martin Fowler', 'Chief Scientist at ThoughtWorks, author of Refactoring and Patterns of Enterprise Application Architecture.'),
('Fred Brooks', 'Turing Award recipient, leader of IBM System/360, author of The Mythical Man-Month.'),
('Charles Petzold', 'Pioneering computer science author, creator of Code: The Hidden Language of Computer Hardware.'),
('Michael Feathers', 'Software engineering consultant, author of Working Effectively with Legacy Code.'),
('Stephen Hawking', 'Theoretical physicist and cosmologist, author of A Brief History of Time.'),
('Richard Feynman', 'Nobel laureate in Physics, teacher and author of The Feynman Lectures on Physics.'),
('Carl Sagan', 'Astronomer, astrophysicist, science communicator and author of Cosmos.'),
('Douglas Hofstadter', 'Cognitive scientist and Pulitzer Prize-winning author of Gödel, Escher, Bach.'),
('George Orwell', 'English novelist, essayist, journalist and critic, author of 1984 and Animal Farm.'),
('Frank Herbert', 'American science fiction author, creator of the Dune saga.'),
('Isaac Asimov', 'Visionary science fiction author and biochemist, creator of the Foundation and Robot series.'),
('Philip K. Dick', 'Pioneering sci-fi author of altered realities, author of Do Androids Dream of Electric Sheep?'),
('James Clear', 'Author and speaker on behavioral change, habits, and continuous improvement.');

-- 3. Insert Multilingual Books with Category Subqueries
INSERT INTO books (title, isbn, publication_year, summary, category_id, language, original_language) VALUES
-- Tamil (ta)
('திருக்குறள் (Thirukkural)', '978-8123400011', 100, 'Universal treatise on ethics, political wisdom, virtue, wealth, and love in 1330 rhyming couplets.', (SELECT id FROM categories WHERE name = 'Philosophy'), 'ta', 'ta'),
('பொன்னியின் செல்வன் (Ponniyin Selvan)', '978-8123400028', 1954, 'Epic historical saga of the Chola empire, palace conspiracies, prince Arulmozhivarman, and Vandiyathevan.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ta', 'ta'),
('சிலப்பதிகாரம் (Silappathikaram)', '978-8123400035', 500, 'Ancient Tamil epic narrating the tragic justice of Kannagi, Kovalan, and the Pandya king of Madurai.', (SELECT id FROM categories WHERE name = 'Drama & Poetry'), 'ta', 'ta'),
('பார்த்திபன் கனவு (Parthiban Kanavu)', '978-8123400042', 1941, 'Historical novel celebrating the Pallava-Chola warfare, freedom dreams, and martial honor.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ta', 'ta'),
('பாரதியார் கவிதைகள் (Bharathiyar Kavithaigal)', '978-8123400059', 1922, 'Fiery patriotic verses, spiritual hymns, and social reformist poetry of Subramania Bharati.', (SELECT id FROM categories WHERE name = 'Drama & Poetry'), 'ta', 'ta'),
('சிவகாமியின் சபதம் (Sivagamiyin Sabatham)', '978-8123400073', 1948, 'Masterpiece historical novel of 7th-century Pallava emperor Narasimhavarman, sculptor Sivagami, and Vatapi.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ta', 'ta'),
('குற்றாலக் குறவஞ்சி (Kutrala Kuravanji)', '978-8123400080', 1715, 'Exquisite classical Tamil lyrical drama depicting Courtallam falls, nature aesthetics, and divine devotion.', (SELECT id FROM categories WHERE name = 'Drama & Poetry'), 'ta', 'ta'),
('மனிதாபிமானம் (Manithabimanam)', '978-8123400097', 1965, 'Humanistic social realistic collection of short stories depicting the struggles and dignity of everyday people.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ta', 'ta'),

-- Hindi (hi)
('गोदान (Godan)', '978-8171820016', 1936, 'Seminal realistic depiction of Indian peasant life, debt exploitation, Hori''s yearning for a cow, and agrarian struggles.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'hi', 'hi'),
('रश्मिरथी (Rashmirathi)', '978-8171820023', 1952, 'Heroic Hindi poetic epic exploring the valor, destiny, generosity, and tragedy of Karna in the Mahabharata.', (SELECT id FROM categories WHERE name = 'Drama & Poetry'), 'hi', 'hi'),
('मधुशाला (Madhushala)', '978-8171820030', 1935, 'Philosophical Sufi-inspired Hindi poem reflecting on life, destiny, unity, and truth through metaphorical tavern imagery.', (SELECT id FROM categories WHERE name = 'Drama & Poetry'), 'hi', 'hi'),
('गबन (Gaban)', '978-8171820047', 1931, 'Moral and social realism novel portraying middle-class greed, embezzlement, jewelry obsession, and redemption.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'hi', 'hi'),
('कामायनी (Kamayani)', '978-8171820061', 1936, 'Allegorical Hindi epic tracing human evolution, emotions, intellect, consciousness, and the Great Deluge.', (SELECT id FROM categories WHERE name = 'Drama & Poetry'), 'hi', 'hi'),
('राग दरबारी (Raag Darbari)', '978-8171820054', 1968, 'Masterful political satire exposing post-independence village politics, education mafias, and corruption.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'hi', 'hi'),
('तमस (Tamas)', '978-8171820078', 1974, 'Powerful Sahitya Akademi winning partition novel examining communal polarization, human vulnerability, and communal tragedy.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'hi', 'hi'),
('मैला आँचल (Maila Anchal)', '978-8171820085', 1954, 'Pioneering regional Hindi epic set in Bihar capturing rural politics, social caste tensions, and emerging modernization.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'hi', 'hi'),
('शेखर: एक जीवनी (Shekhar: Ek Jivani)', '978-8171820092', 1941, 'Intense psychological stream-of-consciousness novel chronicling a young rebel''s intellectual awakening and quest for freedom.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'hi', 'hi'),

-- Sanskrit (sa)
('श्रीमद्भगवद्गीता (Bhagavad Gita)', '978-8120800013', 200, 'Timeless 700-verse philosophical dialogue between Krishna and Arjuna on duty, karma, yoga, and liberation.', (SELECT id FROM categories WHERE name = 'Philosophy'), 'sa', 'sa'),
('अभिज्ञानशाकुन्तलम् (Abhijnanashakuntalam)', '978-8120800020', 400, 'Celebrated Sanskrit romantic drama recounting the love, ring curse, and reunion of King Dushyanta and Shakuntala.', (SELECT id FROM categories WHERE name = 'Drama & Poetry'), 'sa', 'sa'),
('मेघदूतम् (Meghadutam)', '978-8120800037', 420, 'Lyrical Sanskrit poem of an exiled Yaksha sending a cloud messenger across India to his beloved in Alaka.', (SELECT id FROM categories WHERE name = 'Drama & Poetry'), 'sa', 'sa'),
('पञ्चतन्त्रम् (Panchatantra)', '978-8120800044', 300, 'Ancient collection of interrelated animal fables teaching statecraft, moral conduct, friendship, and practical wisdom.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'sa', 'sa'),
('अर्थशास्त्रम् (Arthashastra)', '978-8120800051', 300, 'Foundational Sanskrit treatise on statecraft, political strategy, espionage, taxation, military theory, and governance.', (SELECT id FROM categories WHERE name = 'Economics & Strategy'), 'sa', 'sa'),

-- Spanish (es)
('Cien años de soledad', '978-0307474728', 1967, 'Multi-generational epic of the Buendía family in the mythical town of Macondo, blending magical realism and Latin history.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'es', 'es'),
('Don Quijote de la Mancha', '978-8420412146', 1605, 'The founding novel of Western literature, chronicling the chivalric delusions of Don Quixote and Sancho Panza.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'es', 'es'),
('Ficciones', '978-0802130303', 1944, 'Collection of metaphysical labyrinths, infinite libraries, detective riddles, and philosophical paradoxes.', (SELECT id FROM categories WHERE name = 'Philosophy'), 'es', 'es'),
('El amor en los tiempos del cólera', '978-0307389732', 1985, 'Poignant romantic narrative of Florentino Ariza and Fermina Daza spanning half a century of patience and enduring passion.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'es', 'es'),
('Veinte poemas de amor y una canción desesperada', '978-0140186482', 1924, 'Passionate lyric poetry expressing youth, romantic longing, melancholia, and sensual discovery.', (SELECT id FROM categories WHERE name = 'Drama & Poetry'), 'es', 'es'),
('La sombra del viento', '978-0143034902', 2001, 'Atmospheric Gothic mystery set in postwar Barcelona centering on the mystical Cemetery of Forgotten Books.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'es', 'es'),
('Rayuela (Hopscotch)', '978-8466331906', 1963, 'Avant-garde counter-novel featuring multiple non-linear reading sequences between Paris and Buenos Aires.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'es', 'es'),

-- French (fr)
('Le Petit Prince', '978-0156012195', 1943, 'Enchanting philosophical fable exploring human nature, love, responsibility, and the secret of seeing with the heart.', (SELECT id FROM categories WHERE name = 'Philosophy'), 'fr', 'fr'),
('L''Étranger', '978-2070360024', 1942, 'Seminal existentialist novel following Meursault''s alienation, emotional detachment, and murder on an Algiers beach.', (SELECT id FROM categories WHERE name = 'Philosophy'), 'fr', 'fr'),
('Les Misérables', '978-2253096337', 1862, 'Monumental epic of redemption, justice, Jean Valjean, Inspector Javert, Fantine, and the Paris June Rebellion.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'fr', 'fr'),
('À la recherche du temps perdu', '978-2070754922', 1913, 'Masterpiece of involuntary memory, aristocratic French society, the madeleine cake, and reflections on art and time.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'fr', 'fr'),
('Madame Bovary', '978-2070413119', 1856, 'Realist masterpiece chronicling Emma Bovary''s romantic illusions, provincial banality, and tragic downward spiral.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'fr', 'fr'),
('Le Comte de Monte-Cristo', '978-2070405947', 1844, 'Thrilling historical revenge adventure of Edmond Dantès, betrayal at Château d''If, and miraculous resurrection of justice.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'fr', 'fr'),
('Candide', '978-2070404094', 1759, 'Hilarious Enlightenment philosophical picaresque satirizing Leibnizian optimism across global adventures.', (SELECT id FROM categories WHERE name = 'Philosophy'), 'fr', 'fr'),

-- German (de)
('Faust: Eine Tragödie', '978-3150000014', 1808, 'Universal poetic drama of scholar Faust''s pact with Mephistopheles in pursuit of ultimate knowledge and worldly pleasure.', (SELECT id FROM categories WHERE name = 'Drama & Poetry'), 'de', 'de'),
('Die Verwandlung (The Metamorphosis)', '978-3150099001', 1915, 'Surreal novella detailing Gregor Samsa''s waking transformation into a giant insect and subsequent alienation.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'de', 'de'),
('Also sprach Zarathustra', '978-3150071113', 1883, 'Philosophical work introducing the Übermensch, will to power, and the eternal return through prophetic speeches.', (SELECT id FROM categories WHERE name = 'Philosophy'), 'de', 'de'),
('Siddhartha', '978-3518366820', 1922, 'Spiritual journey of a young Indian seeker striving for self-discovery, enlightenment, and harmony along the river.', (SELECT id FROM categories WHERE name = 'Philosophy'), 'de', 'de'),
('Kritik der reinen Vernunft', '978-3518276013', 1781, 'Monumental epistemological critique examining the limits of reason, synthetic a priori judgments, space and time.', (SELECT id FROM categories WHERE name = 'Philosophy'), 'de', 'de'),
('Der Steppenwolf', '978-3518366745', 1927, 'Introspective psychological novel exploring Harry Haller''s divided soul between bourgeois intellect and primal beast.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'de', 'de'),
('Die Blechtrommel (The Tin Drum)', '978-3423118217', 1959, 'Iconic magical realist chronicle of Oskar Matzerath refusing to grow up amidst wartime Nazi Germany.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'de', 'de'),

-- Japanese (ja)
('ノルウェイの森 (Norwegian Wood)', '978-4062748681', 1987, 'Nostalgic and emotional coming-of-age story set in 1960s Tokyo exploring love, loss, mental illness, and youth.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ja', 'ja'),
('人間失格 (No Longer Human)', '978-4101006017', 1948, 'Intense psychological semi-autobiographical chronicle of Oba Yozo''s inability to reveal his true self to society.', (SELECT id FROM categories WHERE name = 'Psychology & Neuroscience'), 'ja', 'ja'),
('こころ (Kokoro)', '978-4101010014', 1914, 'Subtle and powerful exploration of isolation, guilt, egoism, and the generational shift in Meiji era Japan.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ja', 'ja'),
('源氏物語 (The Tale of Genji)', '978-4003001516', 1010, 'Regarded as the world''s first novel, capturing Heian aristocratic court intrigue, aesthetic sensibility (mono no aware), and romance.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ja', 'ja'),
('雪国 (Snow Country)', '978-4101001012', 1948, 'Lyrical Nobel Prize masterpiece set in a remote hot-spring onsen town portraying beauty, isolation, and unfulfilled love.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ja', 'ja'),
('金閣寺 (The Temple of the Golden Pavilion)', '978-4101050010', 1956, 'Dark psychological drama based on the real burning of Kyoto''s golden temple by an alienated Buddhist acolyte.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ja', 'ja'),

-- Russian (ru)
('Война и мир (War and Peace)', '978-5389062566', 1869, 'Grand panorama of Russian society during the Napoleonic Wars, interwoven with philosophy, history, and family sagas.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ru', 'ru'),
('Преступление и наказание (Crime and Punishment)', '978-5389062573', 1866, 'Psychological duel of impoverished student Raskolnikov following a premeditated murder and his moral crisis.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ru', 'ru'),
('Мастер и Маргарита (The Master and Margarita)', '978-5389062580', 1967, 'Brilliant supernatural satire of the Devil visiting Soviet Moscow alongside Pontius Pilate in ancient Jerusalem.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ru', 'ru'),
('Братья Карамазовы (The Brothers Karamazov)', '978-5389062603', 1880, 'Passionate philosophical novel addressing faith, free will, morality, patricide, and the Grand Inquisitor.', (SELECT id FROM categories WHERE name = 'Philosophy'), 'ru', 'ru'),
('Анна Каренина (Anna Karenina)', '978-5389062597', 1878, 'Tragic aristocratic love affair between Anna and Count Vronsky contrasted with Levin''s quest for rural meaning and happiness.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ru', 'ru'),
('Евгений Онегин (Eugene Onegin)', '978-5389062610', 1833, 'Masterpiece novel in verse embodying Russian Romanticism, missed opportunities, duel tragedy, and Tatyana''s letter.', (SELECT id FROM categories WHERE name = 'Drama & Poetry'), 'ru', 'ru'),
('Отцы и дети (Fathers and Sons)', '978-5389062627', 1862, 'Seminal exploration of Russian generational conflict, nihilism, Bazarov''s scientific materialism, and changing values.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ru', 'ru'),

-- Chinese (zh)
('三体 (The Three-Body Problem)', '978-7536692930', 2008, 'Groundbreaking hard sci-fi epic spanning astrophysical conspiracy, virtual reality games, and alien Trisolaran invasion.', (SELECT id FROM categories WHERE name = 'Science Fiction'), 'zh', 'zh'),
('孙子兵法 (The Art of War)', '978-7101073850', 500, 'Ancient strategic military treatise outlining tactics, deception, maneuvering, terrain, and psychological warfare.', (SELECT id FROM categories WHERE name = 'Economics & Strategy'), 'zh', 'zh'),
('道德经 (Tao Te Ching)', '978-7101073867', 400, 'Foundational Taoist text teaching the virtue of non-action (Wu Wei), humility, balance, and natural harmony.', (SELECT id FROM categories WHERE name = 'Philosophy'), 'zh', 'zh'),
('红楼梦 (Dream of the Red Chamber)', '978-7020002207', 1791, 'Exquisite pinnacle of classical Chinese fiction capturing the rise, opulence, and decline of the Jia aristocracy.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'zh', 'zh'),
('西游记 (Journey to the West)', '978-7020002221', 1592, 'Legendary mythological adventure of the Monkey King Sun Wukong and Buddhist monk Xuanzang traveling to India.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'zh', 'zh'),
('三国演义 (Romance of the Three Kingdoms)', '978-7020002214', 1522, 'Epic historical saga of military strategy, fraternal loyalty, and empire division between Shu, Wei, and Wu.', (SELECT id FROM categories WHERE name = 'History & Civilizations'), 'zh', 'zh'),

-- Arabic (ar)
('ألف ليلة وليلة (One Thousand and One Nights)', '978-9953890012', 1200, 'Legendary folklore collection framed by Scheherazade''s tales of Aladdin, Sinbad, genies, and ancient Arabia.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ar', 'ar'),
('مقدمة ابن خلدون (The Muqaddimah)', '978-9953890029', 1377, 'Foundational historical and sociological treatise analyzing tribal solidarity (Asabiyyah), dynasties, and civilizational cycles.', (SELECT id FROM categories WHERE name = 'History & Civilizations'), 'ar', 'ar'),
('النبي (The Prophet)', '978-9953890036', 1923, 'Spiritual collection of poetic essays on love, marriage, children, work, joy, sorrow, and freedom.', (SELECT id FROM categories WHERE name = 'Philosophy'), 'ar', 'ar'),
('أولاد حارتنا (Children of Gebelawi)', '978-9770900018', 1959, 'Bold allegorical novel recounting the spiritual history of humanity through a Cairo alley and its patriarchs.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'ar', 'ar'),

-- Italian, Latin & Greek Classics (it, la, el)
('La Divina Commedia', '978-8804677765', 1320, 'Monumental vision of the afterlife traversing Inferno, Purgatorio, and Paradiso guided by Virgil and Beatrice.', (SELECT id FROM categories WHERE name = 'Drama & Poetry'), 'it', 'it'),
('Il Principe (The Prince)', '978-8804677772', 1532, 'Realpolitik guide to acquiring and maintaining political power through pragmatic virtue and calculated fortune.', (SELECT id FROM categories WHERE name = 'Economics & Strategy'), 'it', 'it'),
('Il Decameron', '978-8804677789', 1353, 'Classic collection of 100 witty and lively tales told by ten young Florentines sheltering from the Black Death.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'it', 'it'),
('Il nome della rosa (The Name of the Rose)', '978-8845278655', 1980, 'Intricate medieval abbey murder mystery exploring semiotics, biblical analysis, Aristotle''s lost comedy, and heresy.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'it', 'it'),
('Meditationes (Meditations)', '978-0140449334', 180, 'Personal private journal of Roman Emperor Marcus Aurelius on Stoic resilience, mortality, duty, and tranquility.', (SELECT id FROM categories WHERE name = 'Philosophy'), 'la', 'la'),
('The Republic (Πολιτεία)', '978-0140455113', 375, 'Plato''s foundational dialogue on justice, the philosopher king, the ideal city-state, and the Allegory of the Cave.', (SELECT id FROM categories WHERE name = 'Philosophy'), 'el', 'el'),
('The Odyssey (Ὀδύσσεια)', '978-0140268867', 750, 'Ancient Greek epic of Odysseus''s perilous decade-long journey home to Ithaca after the fall of Troy.', (SELECT id FROM categories WHERE name = 'Drama & Poetry'), 'el', 'el'),

-- Computer Science, Software Engineering & Systems (en)
('Clean Code', '978-0132350884', 2008, 'Practical handbook on writing clean, readable, testable, and maintainable software with real refactoring examples.', (SELECT id FROM categories WHERE name = 'Computer Science'), 'en', 'en'),
('Design Patterns', '978-0201633610', 1994, 'Catalog of 23 reusable object-oriented solutions including Factory, Singleton, Observer, and Strategy patterns.', (SELECT id FROM categories WHERE name = 'Computer Science'), 'en', 'en'),
('Introduction to Algorithms (CLRS)', '978-0262033848', 2009, 'Comprehensive textbook on algorithmic theory, graph theory, dynamic programming, and complexity analysis.', (SELECT id FROM categories WHERE name = 'Mathematics'), 'en', 'en'),
('Structure and Interpretation of Computer Programs', '978-0262510875', 1996, 'MIT computer science classic exploring computational processes, abstraction, interpreters, and Lisp metacircular design.', (SELECT id FROM categories WHERE name = 'Computer Science'), 'en', 'en'),
('Deep Learning', '978-0262035613', 2016, 'The definitive text on machine learning mathematical foundations, deep feedforward nets, CNNs, and generative models.', (SELECT id FROM categories WHERE name = 'Computer Science'), 'en', 'en'),
('Designing Data-Intensive Applications', '978-1449373320', 2017, 'Essential guide to storage engines, distributed consensus, transactions, replication, and stream processing architectures.', (SELECT id FROM categories WHERE name = 'Computer Science'), 'en', 'en'),
('Refactoring', '978-0134757599', 2018, 'Step-by-step principles for improving legacy codebase architectures without changing external behaviors.', (SELECT id FROM categories WHERE name = 'Computer Science'), 'en', 'en'),
('The Pragmatic Programmer', '978-0135957059', 2019, 'Timeless advice on software craftsmanship, career mastery, automation, orthogonal systems, and continuous learning.', (SELECT id FROM categories WHERE name = 'Computer Science'), 'en', 'en'),
('The Mythical Man-Month', '978-0201835953', 1995, 'Timeless software project management essays on Brook''s Law, second-system syndrome, and conceptual integrity.', (SELECT id FROM categories WHERE name = 'Computer Science'), 'en', 'en'),
('Code: The Hidden Language of Computer Hardware and Software', '978-0735611313', 2000, 'Illuminating journey into electricity, logic gates, binary math, and computer architecture from first principles.', (SELECT id FROM categories WHERE name = 'Computer Science'), 'en', 'en'),
('Clean Architecture', '978-0134494167', 2017, 'Architectural patterns for creating decoupled, testable, framework-independent enterprise systems.', (SELECT id FROM categories WHERE name = 'Computer Science'), 'en', 'en'),
('Working Effectively with Legacy Code', '978-0131177055', 2004, 'Mastery strategies for refactoring untested legacy software, breaking dependencies, and adding safety nets.', (SELECT id FROM categories WHERE name = 'Computer Science'), 'en', 'en'),
('Computer Systems: A Programmer''s Perspective', '978-0134092669', 2015, 'Hardware-software bridge covering assembly language, memory hierarchies, virtual memory, and concurrent programming.', (SELECT id FROM categories WHERE name = 'Computer Science'), 'en', 'en'),
('Reinforcement Learning: An Introduction', '978-0262039246', 2018, 'Comprehensive foundation of Markov decision processes, Monte Carlo methods, TD learning, and Q-learning in AI.', (SELECT id FROM categories WHERE name = 'Computer Science'), 'en', 'en'),

-- Science, Physics & Mathematics (en)
('A Brief History of Time', '978-0553380163', 1988, 'Landmark exploration of the Big Bang, black holes, time travel, general relativity, and quantum gravity.', (SELECT id FROM categories WHERE name = 'Physics & Astronomy'), 'en', 'en'),
('The Feynman Lectures on Physics', '978-0465024933', 1964, 'Iconic three-volume masterclass on classical mechanics, electromagnetism, thermodynamics, and quantum physics.', (SELECT id FROM categories WHERE name = 'Physics & Astronomy'), 'en', 'en'),
('Cosmos', '978-0345539434', 1980, 'Poetic voyage across 15 billion years of cosmic evolution, planetary science, human curiosity, and civilization.', (SELECT id FROM categories WHERE name = 'Physics & Astronomy'), 'en', 'en'),
('Gödel, Escher, Bach', '978-0465026562', 1979, 'Pulitzer-winning exploration of recursion, mathematical logic, formal systems, brains, and artificial intelligence.', (SELECT id FROM categories WHERE name = 'Mathematics'), 'en', 'en'),
('The Selfish Gene', '978-0198788607', 1976, 'Revolutionary gene-centric view of natural selection, evolutionary biology, altruism, and cultural memes.', (SELECT id FROM categories WHERE name = 'Physics & Astronomy'), 'en', 'en'),
('Quantum Computation and Quantum Information', '978-1107002173', 2010, 'The standard textbook on qubits, quantum circuits, Shor''s algorithm, error correction, and quantum cryptography.', (SELECT id FROM categories WHERE name = 'Mathematics'), 'en', 'en'),

-- Science Fiction, Classics & World Literature (en)
('1984', '978-0451524935', 1949, 'Chilling dystopian warning of totalitarian surveillance, Big Brother, Newspeak, doublethink, and memory holes.', (SELECT id FROM categories WHERE name = 'Science Fiction'), 'en', 'en'),
('Brave New World', '978-0060850524', 1932, 'Visionary dystopia of genetic engineering, conditioning, consumerism, and state-sanctioned artificial happiness.', (SELECT id FROM categories WHERE name = 'Science Fiction'), 'en', 'en'),
('Dune', '978-0441172719', 1965, 'Epic sci-fi masterpiece of ecology, spice melange, political intrigue, and Paul Atreides on desert planet Arrakis.', (SELECT id FROM categories WHERE name = 'Science Fiction'), 'en', 'en'),
('Foundation', '978-0553293357', 1951, 'Psychohistorian Hari Seldon predicts the galactic empire''s collapse and establishes a sanctuary for human knowledge.', (SELECT id FROM categories WHERE name = 'Science Fiction'), 'en', 'en'),
('Do Androids Dream of Electric Sheep?', '978-0345404473', 1968, 'Post-apocalyptic bounty hunter Rick Deckard tracks rogue replicants while questioning human empathy.', (SELECT id FROM categories WHERE name = 'Science Fiction'), 'en', 'en'),
('The Great Gatsby', '978-0743273565', 1925, 'Quintessential American novel of jazz age obsession, disillusionment, wealth, and the elusive green light.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'en', 'en'),
('Pride and Prejudice', '978-0141439518', 1813, 'Classic comedy of manners exploring marriage, social status, and the tumultuous courtship of Elizabeth Bennet and Mr. Darcy.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'en', 'en'),
('To Kill a Mockingbird', '978-0060935467', 1960, 'Pulitzer Prize-winning Southern novel of racial injustice, moral courage, and childhood innocence in Maycomb, Alabama.', (SELECT id FROM categories WHERE name = 'Literature & Fiction'), 'en', 'en'),
('Man''s Search for Meaning', '978-0807014295', 1946, 'Psychiatrist Viktor Frankl''s memoir of surviving Auschwitz and developing Logotherapy based on the search for purpose.', (SELECT id FROM categories WHERE name = 'Psychology & Neuroscience'), 'en', 'en'),
('Atomic Habits', '978-0735211292', 2018, 'Actionable framework for building good habits, breaking bad ones, and achieving continuous 1% compounding gains.', (SELECT id FROM categories WHERE name = 'Psychology & Neuroscience'), 'en', 'en');

-- 4. Map Authors to Books (Subqueries by ISBN and Author Name)
INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8123400011' AND a.name LIKE '%Tiruvalluvar%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8123400028' AND a.name LIKE '%Kalki%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8123400035' AND a.name LIKE '%Ilango%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8123400042' AND a.name LIKE '%Kalki%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8123400059' AND a.name LIKE '%Subramania Bharati%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8123400073' AND a.name LIKE '%Kalki%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8123400080' AND a.name LIKE '%Thirikooda%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8123400097' AND a.name LIKE '%Jayakanthan%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8171820016' AND a.name LIKE '%Munshi Premchand%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8171820023' AND a.name LIKE '%Ramdhari Singh Dinkar%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8171820030' AND a.name LIKE '%Harivansh Rai Bachchan%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8171820047' AND a.name LIKE '%Munshi Premchand%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8171820061' AND a.name LIKE '%Jaishankar Prasad%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8171820054' AND a.name LIKE '%Munshi Premchand%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8171820078' AND a.name LIKE '%Bhisham Sahni%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8171820085' AND a.name LIKE '%Phanishwar%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8171820092' AND a.name LIKE '%Agyeya%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8120800013' AND a.name LIKE '%Vedavyasa%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8120800020' AND a.name LIKE '%Kalidasa%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8120800037' AND a.name LIKE '%Kalidasa%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8120800044' AND a.name LIKE '%Vishnu Sharma%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8120800051' AND a.name LIKE '%Chanakya%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0307474728' AND a.name LIKE '%García Márquez%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8420412146' AND a.name LIKE '%Cervantes%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0802130303' AND a.name LIKE '%Borges%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0307389732' AND a.name LIKE '%García Márquez%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0140186482' AND a.name LIKE '%Neruda%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0143034902' AND a.name LIKE '%Ruiz Zafón%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8466331906' AND a.name LIKE '%Cortázar%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0156012195' AND a.name LIKE '%Saint-Exupéry%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-2070360024' AND a.name LIKE '%Camus%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-2253096337' AND a.name LIKE '%Victor Hugo%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-2070754922' AND a.name LIKE '%Proust%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-2070413119' AND a.name LIKE '%Flaubert%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-2070405947' AND a.name LIKE '%Dumas%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-2070404094' AND a.name LIKE '%Voltaire%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-3150000014' AND a.name LIKE '%Goethe%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-3150099001' AND a.name LIKE '%Kafka%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-3150071113' AND a.name LIKE '%Nietzsche%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-3518366820' AND a.name LIKE '%Hesse%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-3518276013' AND a.name LIKE '%Kant%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-3518366745' AND a.name LIKE '%Hesse%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-3423118217' AND a.name LIKE '%Grass%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-4062748681' AND a.name LIKE '%Murakami%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-4101006017' AND a.name LIKE '%Dazai%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-4101010014' AND a.name LIKE '%Sōseki%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-4003001516' AND a.name LIKE '%Murasaki%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-4101001012' AND a.name LIKE '%Kawabata%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-4101050010' AND a.name LIKE '%Mishima%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-5389062566' AND a.name LIKE '%Tolstoy%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-5389062573' AND a.name LIKE '%Dostoevsky%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-5389062580' AND a.name LIKE '%Bulgakov%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-5389062603' AND a.name LIKE '%Dostoevsky%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-5389062597' AND a.name LIKE '%Tolstoy%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-5389062610' AND a.name LIKE '%Pushkin%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-5389062627' AND a.name LIKE '%Turgenev%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-7536692930' AND a.name LIKE '%Liu Cixin%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-7101073850' AND a.name LIKE '%Sun Tzu%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-7101073867' AND a.name LIKE '%Laozi%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-7020002207' AND a.name LIKE '%Cao Xueqin%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-7020002221' AND a.name LIKE '%Wu Cheng%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-7020002214' AND a.name LIKE '%Luo Guanzhong%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-9953890012' AND a.name LIKE '%Tiruvalluvar%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-9953890029' AND a.name LIKE '%Ibn Khaldun%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-9953890036' AND a.name LIKE '%Gibran%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-9770900018' AND a.name LIKE '%Naguib Mahfouz%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8804677765' AND a.name LIKE '%Dante%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8804677772' AND a.name LIKE '%Machiavelli%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8804677789' AND a.name LIKE '%Boccaccio%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-8845278655' AND a.name LIKE '%Eco%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0140449334' AND a.name LIKE '%Marcus Aurelius%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0140455113' AND a.name LIKE '%Plato%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0140268867' AND a.name LIKE '%Homer%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0132350884' AND a.name LIKE '%Robert C. Martin%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0201633610' AND a.name LIKE '%Gamma%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0262033848' AND a.name LIKE '%Cormen%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0262510875' AND a.name LIKE '%Abelson%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0262035613' AND a.name LIKE '%Goodfellow%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-1449373320' AND a.name LIKE '%Kleppmann%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0134757599' AND a.name LIKE '%Fowler%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0135957059' AND a.name LIKE '%Fowler%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0201835953' AND a.name LIKE '%Brooks%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0735611313' AND a.name LIKE '%Petzold%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0134494167' AND a.name LIKE '%Robert C. Martin%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0131177055' AND a.name LIKE '%Feathers%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0134092669' AND a.name LIKE '%Abelson%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0262039246' AND a.name LIKE '%Goodfellow%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0553380163' AND a.name LIKE '%Hawking%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0465024933' AND a.name LIKE '%Feynman%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0345539434' AND a.name LIKE '%Sagan%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0465026562' AND a.name LIKE '%Hofstadter%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0198788607' AND a.name LIKE '%Hawking%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-1107002173' AND a.name LIKE '%Hawking%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0451524935' AND a.name LIKE '%Orwell%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0060850524' AND a.name LIKE '%Orwell%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0441172719' AND a.name LIKE '%Herbert%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0553293357' AND a.name LIKE '%Asimov%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0345404473' AND a.name LIKE '%Philip K. Dick%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0743273565' AND a.name LIKE '%Orwell%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0141439518' AND a.name LIKE '%Victor Hugo%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0060935467' AND a.name LIKE '%Orwell%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0807014295' AND a.name LIKE '%Nietzsche%';

INSERT INTO book_authors (book_id, author_id)
SELECT b.id, a.id FROM books b, authors a WHERE b.isbn = '978-0735211292' AND a.name LIKE '%Clear%';

-- 5. Seed Inventory Copies for All New Books (2 Available Copies per Book)
INSERT INTO book_copies (book_id, barcode, condition_note, status)
SELECT b.id, 'BC-BOOK-' || b.id || '-01', 'Mint Condition', 'AVAILABLE'
FROM books b
WHERE b.isbn NOT IN ('978-0134610993', '978-0201896831', '978-0451457998', '978-0374533557');

INSERT INTO book_copies (book_id, barcode, condition_note, status)
SELECT b.id, 'BC-BOOK-' || b.id || '-02', 'Good condition, shelf copy', 'AVAILABLE'
FROM books b
WHERE b.isbn NOT IN ('978-0134610993', '978-0201896831', '978-0451457998', '978-0374533557');
