"""Original A2-preparation drafts. Generate JSON; review linguistically before classroom use."""
import json,hashlib
from pathlib import Path

units=[]

def q(prompt, answer, *wrong):
    return dict(prompt=prompt, options=[answer,*wrong],correct=0, explanation=f'A informação relevante é: {answer}.')

def case(uid, mode, title, doc, msg, rq, mq, dialogue, announcement, aq, cq, writing, speaking, mediation):
    # A different ordering per question prevents a constant answer position.
    def shuffled(question, n):
        options=question['options']; offset=int(hashlib.sha256(f'{uid}:{mode}:{question["prompt"]}:{n}'.encode()).hexdigest()[:8],16)%len(options)
        return {**question,'options':options[offset:]+options[:offset],'correct':(-offset)%len(options)}
    file=lambda name:f'audio/a2/{uid}-{mode}-{name}.m4a'
    conv=[dict(voice='Xander' if i%2==0 else 'Ellen',text=line) for i,line in enumerate(dialogue)]
    return dict(id=mode,title=title,
      documents=[dict(title='Documento da situação',text=doc,questions=[shuffled(rq,1)]),dict(title='Mensagem recebida',text=msg,questions=[shuffled(mq,2)])],
      audios=[dict(title='Conversa',text='\n'.join(dialogue),segments=conv,file=file('conversation'),questions=[shuffled(cq,1)]),dict(title='Recado ou anúncio',text=announcement,segments=[dict(voice='Xander',text=announcement)],file=file('announcement'),questions=[shuffled(aq,2)])],
      writing=dict(instruction=writing[0],points=writing[1],samples=[writing[2]]),
      speaking=dict(instruction=speaking[0],points=speaking[1],samples=[speaking[2]]),
      mediation=dict(instruction=mediation[0],points=mediation[1],samples=[mediation[2]],source=announcement),
      dialogue=[dict(prompt=prompt,instruction=instruction,sample=sample,file=file(f'turn-{i}')) for i,(prompt,instruction,sample) in enumerate([
        (dialogue[0],'Formule sua resposta em holandês e dê a informação solicitada.',dialogue[1]),
        ('Kunt u dat iets duidelijker uitleggen?','Explique sua situação com outras palavras. Use a informação dos documentos.',speaking[2]),
        ('Heeft u nog een vraag?','Peça uma repetição ou confirmação e encerre de forma educada.','Kunt u dat alstublieft herhalen? Dank u wel voor uw hulp.')])])

def add(uid,title,objective,icon,make,values,routes):
    units.append(dict(id=uid,title=title,objective=objective,icon=icon,reviewStatus='draft',supportRoutes=[dict(label=l,route='/practice/'+r) for l,r in routes],cases=[make(uid,mode,*value) for mode,value in zip(['practice','check','review'],values)]))

def transport(uid,mode,city,time,arrival,platform,newplatform,delay):
    doc=f'Reis naar {city}\nVertrek: {time}\nAankomst: {arrival}\nSpoor: {platform}\nEen enkele reis kost € 12,50.'
    msg=f'Hallo! Ik wacht op je bij de uitgang van station {city}. Stuur mij een bericht als je trein vertraging heeft. Groetjes, Noor.'
    announcement=f'Let op. De trein naar {city} van {time} heeft {delay} minuten vertraging. Deze trein vertrekt vandaag van spoor {newplatform}, niet van spoor {platform}. Kijk voor vertrek nog even op het informatiebord.'
    dialogue=[f'Goedemorgen. Waar wilt u naartoe?',f'Ik wil naar {city}. Welke trein kan ik nemen?',f'De trein van {time}. Op uw kaartje staat spoor {platform}. Controleer ook het bord voor wijzigingen.']
    return case(uid,mode,f'Naar {city}',doc,msg,q('De acordo com o bilhete, a que horas é a chegada?',arrival,time,'23:50'),q('O que Noor pede se houver atraso?','Stuur een bericht.','Koop een retourkaartje.','Wacht thuis.'),dialogue,announcement,q('De qual plataforma o trem sai após a mudança?',newplatform,platform,'12'),q('O que você deve verificar antes de partir?','Het informatiebord.','De menukaart.','Het weerbericht.'),('Escreva para Noor avisando o atraso e a plataforma nova.',['Diga o destino.',f'Informe {delay} minutos de atraso.',f'Mencione a plataforma {newplatform}.'],f'Hallo Noor, mijn trein naar {city} heeft {delay} minuten vertraging. Hij vertrekt van spoor {newplatform}. Ik kom later.'),('Grave uma pergunta para obter informações sobre a viagem.',['Diga para onde quer ir.','Pergunte de qual plataforma sai o trem.','Peça confirmação de forma educada.'],f'Goedemorgen, ik wil naar {city}. Van welk spoor vertrekt mijn trein? Kunt u dat bevestigen?'),('Explique em português para um amigo a alteração anunciada.',['Transmita o destino.',f'Informe o atraso de {delay} minutos.',f'Avise que agora é a plataforma {newplatform}.'],f'O trem para {city} está {delay} minutos atrasado e agora sai da plataforma {newplatform}.'))
add('transport','Transporte · trem e atraso','Entender horários, pedir informação e comunicar uma mudança de viagem.','bi-train-front',transport,[('Leiden','09:10','09:42','2','4','15'),('Delft','14:20','14:55','3','6','10'),('Haarlem','18:05','18:40','5','8','20')],[('Horários','time'),('Perguntas','questions-answers')])

def contacts(uid,mode,name,city,day,time,place):
    doc=f'Taalcafé {city}\nWanneer: {day} om {time}\nWaar: {place}\nGratis toegang. Nieuwe bezoekers zijn welkom. Neem een pen mee.'
    msg=f'Hoi, ik ben {name}. Ik woon in {city} en ik ga ook naar het taalcafé. Wil je bij de ingang afspreken? Ik draag een blauwe jas.'
    dialogue=['Hallo, hoe heet je en waar woon je?',f'Ik heet {name} en ik woon in {city}. Ik wil graag Nederlands oefenen.','Leuk! Dan kunnen we samen naar het taalcafé gaan.']
    ann=f'Welkom bij het taalcafé. Vandaag werken we in kleine groepjes. Nieuwe bezoekers kunnen zich bij de tafel naast de deur aanmelden. De koffie is gratis. We beginnen om {time}.'
    return case(uid,mode,f'Kennismaken met {name}',doc,msg,q('O que você precisa levar?','Een pen.','Een paspoort.','Een lunch.'),q('Como reconhecer a pessoa na entrada?','Een blauwe jas.','Een rode tas.','Een groene fiets.'),dialogue,ann,q('Onde os visitantes novos devem se apresentar?','Bij de tafel naast de deur.','Buiten bij de fietsen.','In de keuken.'),q('Por que a pessoa quer ir ao encontro?','Om Nederlands te oefenen.','Om eten te kopen.','Om een trein te nemen.'),('Responda à mensagem apresentando-se e confirmando o encontro.',['Diga seu nome e onde mora.','Confirme que vai ao encontro.','Combine um local para se encontrar.'],f'Hoi {name}, ik heet Alex en ik woon ook in {city}. Ik kom {day} naar het taalcafé. We kunnen bij de ingang afspreken.'),('Apresente-se para alguém do grupo.',['Diga seu nome e onde mora.','Conte por que está aprendendo holandês.','Faça uma pergunta à outra pessoa.'],'Hallo, ik heet Alex. Ik woon in Nederland en ik leer Nederlands om met mijn buren te praten. Waar woon jij?'),('Explique a um amigo novo como participar do encontro.',['Diga onde os visitantes se apresentam.','Informe que a atividade usa grupos pequenos.','Transmita o horário de início.'],f'O encontro começa às {time}. Os novos visitantes se apresentam na mesa ao lado da porta e trabalham em grupos pequenos.'))
add('contacts','Contatos e apresentações','Apresentar-se, trocar informações e combinar um encontro.','bi-person-vcard',contacts,[('Sara','Utrecht','dinsdag','19:00','de bibliotheek'),('Amir','Amersfoort','donderdag','18:30','het buurthuis'),('Lina','Gouda','zaterdag','10:00','het wijkcentrum')],[('Vocabulário','vocabulary'),('Perguntas','questions-answers')])

def appointment(uid,mode,name,day,time,newday,newtime):
    doc=f'Afspraak bij de kapper\nNaam: {name}\nDag: {day}\nTijd: {time}\nAdres: Marktstraat 12\nKom vijf minuten voor uw afspraak.'
    msg=f'Beste {name}, uw kapper is {day} afwezig. Kunt u {newday} om {newtime} komen? Wilt u vandaag nog antwoorden?'
    dialogue=['Goedemorgen, wanneer heeft u een afspraak?',f'Ik heb {day} om {time} een afspraak, maar ik wil de afspraak verzetten.',f'Dat kan. Er is nog plaats op {newday} om {newtime}.']
    ann=f'Goedemorgen. Dit is een bericht van de kapsalon. Uw nieuwe afspraak is op {newday} om {newtime}. De ingang aan de Marktstraat is gesloten. Gebruik de deur aan de achterkant. U hoeft niets mee te nemen.'
    return case(uid,mode,'Een afspraak verzetten',doc,msg,q('Quanto tempo antes você deve chegar?','Vijf minuten.','Een uur.','Een half uur.'),q('Quando você deve responder à proposta?','Vandaag.','Volgende week.','Na de afspraak.'),dialogue,ann,q('Qual entrada está em uso?','De deur aan de achterkant.','De ingang aan de Marktstraat.','De ingang naast de bank.'),q('Qual é o novo horário?',newtime,time,'22:00'),('Confirme por escrito a nova data e pergunte sobre a entrada.',['Confirme o novo dia.','Confirme o novo horário.','Pergunte qual entrada usar.'],f'Beste kapper, ik kan {newday} om {newtime} komen. Dank u wel. Welke ingang moet ik gebruiken?'),('Ligue para remarcar um compromisso.',['Diga qual compromisso já tinha.','Explique que precisa mudar.','Pergunte se o novo horário está disponível.'],f'Goedemorgen, ik heb {day} om {time} een afspraak. Ik kan dan niet komen. Kan ik {newday} om {newtime} komen?'),('Transmita o recado da recepção a alguém que vai com você.',['Informe o novo dia e horário.','Explique a mudança de entrada.','Diga se precisa levar algo.'],f'A nova visita será {newday}, às {newtime}. A entrada é pela porta dos fundos e não precisamos levar nada.'))
add('appointments','Rotina e compromissos','Confirmar e remarcar horários e esclarecer informações.','bi-calendar3',appointment,[('Alex','maandag','10:00','woensdag','11:30'),('Robin','dinsdag','14:00','vrijdag','09:30'),('Sam','vrijdag','16:00','zaterdag','12:00')],[('Datas','dates'),('Horários','time')])

def home(uid,mode,problem,room,day,time):
    doc=f'Woningservice\nMeld reparaties via een bericht. Beschrijf het probleem en de kamer.\nVoor dringende problemen kunt u bellen tot 18:00.\nZorg dat iemand thuis is tijdens de reparatie.'
    msg=f'Hallo, ik ben uw buurvrouw. Ik heb gezien dat er een monteur komt. Als u {day} niet thuis bent, kan ik de deur voor hem openen. Groet, Eva.'
    dialogue=['Goedemorgen. Wat is het probleem in uw woning?',f'De {problem} in de {room} werkt niet. Kunt u iemand sturen?',f'De monteur kan {day} om {time} komen. Er moet iemand thuis zijn.']
    ann=f'Een bericht van de monteur. Ik kom {day} om {time}. De reparatie duurt ongeveer een uur. Wilt u de ruimte rond de {problem} vrijmaken? U kunt gewoon in de woning blijven.'
    return case(uid,mode,f'Een probleem met de {problem}',doc,msg,q('O que você precisa informar ao pedir reparo?','Het probleem en de kamer.','Uw favoriete kleur.','Uw vakantieplannen.'),q('O que Eva oferece?','De deur openen.','De rekening betalen.','De kamer schilderen.'),dialogue,ann,q('Quanto tempo o reparo deve durar?','Ongeveer een uur.','Twee dagen.','Tien minuten.'),q('Em qual cômodo há um problema?',room,'tuin','garage'),('Escreva à assistência pedindo o reparo.',['Explique o problema.','Indique o cômodo.','Diga quando alguém estará em casa.'],f'Goedemorgen, de {problem} in de {room} werkt niet. Kunt u {day} om {time} komen? Dan ben ik thuis.'),('Explique o problema ao profissional.',['Diga o que não funciona.','Diga onde está.','Pergunte quanto tempo vai levar.'],f'De {problem} in de {room} werkt niet. Hoe lang duurt de reparatie?'),('Explique ao vizinho o que o profissional pediu.',['Informe dia e horário.','Diga quanto tempo dura.','Explique que a área deve ficar livre.'],f'O profissional vem {day} às {time}. O reparo leva aproximadamente uma hora. Precisamos deixar livre o espaço ao redor de {problem}.'))
add('home','Casa e vizinhança','Descrever a moradia e comunicar problemas simples.','bi-house-door',home,[('verwarming','woonkamer','dinsdag','09:00'),('kraan','keuken','donderdag','13:00'),('lamp','badkamer','maandag','15:30')],[('Objetos','articles'),('Preposições','prepositions')])

def shopping(uid,mode,item,size,colour,price,deadline):
    doc=f'Kledingwinkel\nProduct: {item}\nMaat: {size}\nKleur: {colour}\nPrijs: € {price}\nRuilen kan tot {deadline} met de kassabon. Gedragen kleding kunt u niet ruilen.'
    msg=f'Hoi! Ik wil de {item} graag ruilen. De maat is niet goed. Ik heb de kassabon nog en ik heb het kledingstuk niet gedragen. Kun je meegaan naar de winkel?'
    dialogue=['Goedemiddag. Waarmee kan ik u helpen?',f'Ik zoek een {item} in maat {size}. Heeft u die in het {colour}?',f'Ja, die kost {price} euro. U kunt hem in de paskamer proberen.']
    ann=f'Beste klant. Voor het ruilen van kleding heeft u de kassabon nodig. U kunt vandaag tot vijf uur bij de klantenservice terecht. De klantenservice is op de eerste verdieping, naast de lift. U hoeft geen afspraak te maken.'
    return case(uid,mode,'Kleding kopen en ruilen',doc,msg,q('O que é necessário para trocar?','De kassabon.','Een afspraak.','Een nieuw abonnement.'),q('Por que a pessoa quer trocar a compra?','De maat is niet goed.','De winkel is gesloten.','De bon is kwijt.'),dialogue,ann,q('Onde está o atendimento ao cliente?','Op de eerste verdieping naast de lift.','Buiten achter de winkel.','Op de derde verdieping.'),q('O que o cliente pode fazer antes de comprar?','Het kledingstuk passen.','Gratis eten.','Een fiets huren.'),('Responda à loja para pedir uma troca.',['Identifique o produto.','Explique o problema com o tamanho.','Diga que tem o recibo e não usou o produto.'],f'Goedemiddag, ik wil de {item} ruilen omdat de maat niet goed is. Ik heb de kassabon en ik heb het kledingstuk niet gedragen.'),('Peça um produto na loja.',['Diga qual produto quer.','Diga tamanho e cor.','Pergunte se pode experimentar.'],f'Goedemiddag, heeft u een {item} in maat {size} en in het {colour}? Mag ik die passen?'),('Explique a um amigo como fazer a troca.',['Diga o documento necessário.','Informe o local do atendimento.','Informe até que horas funciona.'],'Você precisa do recibo. O atendimento fica no primeiro andar, ao lado do elevador, e hoje funciona até as cinco.'))
add('shopping','Compras e trocas','Consultar produtos, preços e condições de troca.','bi-bag',shopping,[('jas','M','blauw','45','zaterdag'),('trui','L','groen','32','woensdag'),('broek','S','zwart','39','vrijdag')],[('Vocabulário','vocabulary'),('Números','numbers')])

def restaurant(uid,mode,dish,drink,price,closed):
    doc=f'Menu\nGroentesoep € 6\n{dish} € {price}\nWater € 2\nThee € 3\nVraag de bediening naar ingrediënten. De keuken sluit om {closed}.'
    msg=f'Hallo, ik kom iets later naar het restaurant. Wil je alvast een tafel voor twee vragen? Ik eet geen vlees. Kun je vragen of er vegetarische gerechten zijn?'
    dialogue=['Goedenavond. Wat wilt u bestellen?',f'Ik wil graag {dish} en {drink}. Zit er vlees in dit gerecht?','Dit gerecht is vegetarisch. Wilt u het voorgerecht tegelijk met het hoofdgerecht?']
    ann=f'Een bericht van het restaurant. Uw tafel is gereserveerd voor twee personen bij het raam. De keuken sluit om {closed}. Als u later komt, bel ons dan even. U kunt met pin of contant betalen.'
    return case(uid,mode,'Eten bestellen',doc,msg,q('Wat moet je doen als je de ingrediënten wilt weten?','Vraag de bediening.','Ga naar de supermarkt.','Lees de kassabon.'),q('O que a pessoa que enviou a mensagem não come?','Vlees.','Groente.','Brood.'),dialogue,ann,q('Onde fica a mesa reservada?','Bij het raam.','Buiten op straat.','Naast de keuken.'),q('Como é o prato mencionado pelo atendente?','Vegetarisch.','Met kip.','Alleen als ontbijt.'),('Escreva ao restaurante confirmando sua reserva e preferência alimentar.',['Confirme uma mesa para duas pessoas.','Diga que não come carne.','Pergunte se pode chegar um pouco mais tarde.'],'Goedenavond, ik heb een tafel voor twee personen gereserveerd. Ik eet geen vlees. Kunnen we iets later komen?'),('Faça seu pedido e esclareça uma informação.',['Peça um prato e uma bebida.','Pergunte se contém carne.','Use uma expressão de cortesia.'],f'Ik wil graag {dish} en {drink}, alstublieft. Zit er vlees in dit gerecht?'),('Avise a pessoa que vai jantar com você sobre a reserva.',['Informe para quantas pessoas é a mesa.','Diga onde está localizada.','Informe o fechamento da cozinha.'],f'A mesa é para duas pessoas, ao lado da janela. A cozinha fecha às {closed}; se atrasarmos, devemos telefonar.'))
add('restaurant','Restaurante e preferências','Fazer pedidos, expressar preferências e pedir esclarecimentos.','bi-cup-hot',restaurant,[('groentepasta','water','14','21:00'),('groentecurry','thee','16','20:30'),('een salade','water','12','22:00')],[('Negação','negation'),('Conversas','conversations')])

def health(uid,mode,symptom,days,day,time):
    doc=f'Huisartsenpraktijk\nVoor een afspraak: bel tussen 08:00 en 10:00.\nNeem uw identiteitsbewijs en een lijst van medicijnen mee.\nBij spoed: bel het spoednummer van de praktijk. Dit is oefenmateriaal, geen medisch advies.'
    msg=f'Goedemorgen, uw afspraak is bevestigd voor {day} om {time}. Meld u tien minuten eerder bij de balie. De praktijk is naast de apotheek.'
    dialogue=['Goedemorgen. Welke klachten heeft u?',f'Ik heb {symptom}, al {days} dagen. Kan ik een afspraak maken?',f'U kunt {day} om {time} komen. Bel eerder terug als u dringend hulp nodig heeft.']
    ann=f'Goedemorgen. De huisarts werkt vandaag in kamer drie. Meld u eerst bij de balie en wacht daarna in de wachtkamer. Neem uw identiteitsbewijs en uw medicijnlijst mee. Als u niet kunt komen, bel dan om de afspraak af te zeggen.'
    return case(uid,mode,'Een afspraak bij de huisarts',doc,msg,q('O que deve levar à consulta?','Identiteitsbewijs en medicijnlijst.','Alleen een bankpas.','Een treinkaartje.'),q('Quanto tempo antes deve se apresentar?','Tien minuten.','Een uur.','Twee minuten.'),dialogue,ann,q('Onde você deve ir primeiro?','Naar de balie.','Naar kamer drie zonder aanmelden.','Naar de apotheek.'),q('Há quantos dias a pessoa tem o sintoma?',days,'30','1'),('Confirme a consulta e faça uma pergunta prática.',['Informe dia e horário.','Diga que vai levar os documentos.','Pergunte onde deve se apresentar.'],f'Goedemorgen, ik kom {day} om {time}. Ik neem mijn identiteitsbewijs en medicijnlijst mee. Waar moet ik mij melden?'),('Simule uma ligação para marcar consulta.',['Diga qual sintoma tem no cenário.','Informe há quantos dias.','Peça um horário.'],f'Goedemorgen, ik heb {symptom}, al {days} dagen. Kan ik een afspraak maken?'),('Explique a alguém que acompanha você como funciona a chegada.',['Diga onde se apresentar primeiro.','Informe onde esperar.','Diga o que levar.'],'Primeiro devemos nos apresentar no balcão e depois esperar na sala de espera. É preciso levar identificação e a lista de remédios.'))
add('health','Saúde e consulta','Marcar uma consulta e explicar sintomas de um cenário fictício.','bi-heart-pulse',health,[('hoofdpijn','3','maandag','10:20'),('keelpijn','4','woensdag','14:10'),('buikpijn','2','vrijdag','09:40')],[('Corpo','body'),('Datas','dates')])

def work(uid,mode,job,day,time,room):
    doc=f'Werkrooster\nFunctie: {job}\nWerkdag: {day}\nBegin: {time}\nPauze: 12:00 tot 12:30\nTeamoverleg: in {room}. Neem uw notitieboek mee.'
    msg=f'Hoi, ik kan {day} niet bij het teamoverleg zijn. Wil je mij na afloop vertellen wat er is afgesproken? Ik lees mijn berichten na 15:00.'
    dialogue=['Goedemorgen. Hoe laat begint je werk vandaag?',f'Ik begin om {time}. Waar is het teamoverleg?',f'In {room}. Het overleg is direct na de pauze.']
    ann=f'Beste collega’s, het teamoverleg begint vandaag om half één. Neem uw notitieboek mee. We bespreken het rooster voor volgende week. Collega’s die niet aanwezig zijn, krijgen later een bericht met de afspraken.'
    return case(uid,mode,'Rooster en teamoverleg',doc,msg,q('Hoe lang is de pauze?','Een half uur.','Een uur.','Vijf minuten.'),q('O que o colega pede?','Vertel wat er is afgesproken.','Koop een lunch.','Verander de hele planning.'),dialogue,ann,q('A que horas começa a reunião?','12:30','12:00','13:30'),q('Onde será a reunião?',room,'de supermarkt','het station'),('Escreva para o colega que faltou à reunião.',['Informe quando foi a reunião.','Diga qual assunto foi tratado.','Explique que ele receberá as decisões por mensagem.'],'Hoi, het teamoverleg was om half één. We hebben het rooster voor volgende week besproken. Je krijgt later een bericht met de afspraken.'),('Explique sua rotina de trabalho neste cenário.',['Diga sua função.','Informe o início do trabalho e a pausa.','Pergunte pelo local da reunião.'],f'Ik werk als {job}. Ik begin om {time} en ik heb om twaalf uur pauze. Waar is het teamoverleg?'),('Repasse o anúncio para um colega que não o ouviu.',['Informe o horário.','Diga o que deve levar.','Explique o assunto da reunião.'],'A reunião começa às 12h30. É preciso levar o caderno. O assunto será a escala da próxima semana.'))
add('work','Trabalho e mensagens','Entender uma escala e trocar informações com colegas.','bi-briefcase',work,[('verkoper','maandag','08:30','kamer twee'),('kok','dinsdag','09:00','de kantine'),('receptionist','donderdag','08:00','zaal vier')],[('Verbos','verbs'),('Perfectum','perfect-tense')])

def study(uid,mode,course,day,time,room):
    doc=f'Cursus {course}\nLes: {day} om {time}\nLocatie: {room}\nVoor de eerste les: schrijf uw naam op de lijst en neem een schrift mee.\nDe cursus duurt zes weken.'
    msg=f'Hoi, ik volg ook de cursus {course}. Ik ben vorige week ziek geweest en ik heb de les gemist. Kun je vertellen wat ik voor de volgende les moet doen?'
    dialogue=['Waarom wil je deze cursus volgen?',f'Ik wil {course} leren om nieuwe dingen te kunnen doen. Wanneer is de eerste les?',f'De les is {day} om {time} in {room}.']
    ann=f'Beste cursisten. Voor de volgende les moet u de eerste twee bladzijden lezen en drie vragen opschrijven. U hoeft niets in te leveren. We beginnen met een gesprek in kleine groepjes. Neem uw schrift mee.'
    return case(uid,mode,'Een cursus volgen',doc,msg,q('Hoe lang duurt de cursus?','Zes weken.','Twee dagen.','Een heel jaar.'),q('Waarom heeft de cursist de les gemist?','De cursist was ziek.','De trein was te vroeg.','De cursus was vol.'),dialogue,ann,q('Hoeveel vragen moet je opschrijven?','Drie.','Tien.','Geen.'),q('Wanneer is de les?',day,'zondag','elke dag'),('Responda à mensagem do colega.',['Diga o que precisa ler.','Diga quantas perguntas deve preparar.','Explique o que deve levar.'],'Hoi, je moet de eerste twee bladzijden lezen en drie vragen opschrijven. Je hoeft niets in te leveren. Neem je schrift mee.'),('Explique por que quer participar e faça uma pergunta.',['Diga qual curso deseja fazer.','Explique um objetivo com om … te.','Pergunte pelo local ou horário.'],f'Ik wil de cursus {course} volgen om nieuwe dingen te leren. Waar en hoe laat is de les?'),('Transmita em português as instruções do professor.',['Informe a leitura.','Diga quantas perguntas preparar.','Explique se deve entregar algo.'],'Devemos ler as duas primeiras páginas e escrever três perguntas. Não precisamos entregar nada; vamos conversar em grupos pequenos.'))
add('study','Estudos e planos','Compreender instruções e falar de objetivos de aprendizagem.','bi-book',study,[('Nederlands','maandag','19:00','lokaal drie'),('fotografie','woensdag','18:00','zaal twee'),('Spaans','vrijdag','17:30','het buurthuis')],[('Finalidade e perguntas','questions-answers'),('Modais','modal-verbs')])

def past(uid,mode,place,day,activity,returntime):
    action={'een stadswandeling':'een stadswandeling gemaakt','een rondvaart':'een rondvaart gemaakt','een museumbezoek':'een museum bezocht'}[activity]
    doc=f'Weekendprogramma\nPlaats: {place}\nDag: {day}\nActiviteit: {activity}\nVertrek bus: 09:00\nTerug: {returntime}\nNeem zelf eten en drinken mee.'
    msg=f'Hoi, hoe was je uitstapje naar {place}? Wat heb je gedaan en hoe laat was je terug? Ik wil volgende keer ook graag mee.'
    dialogue=['Wat heb je afgelopen weekend gedaan?',f'Ik ben naar {place} gegaan. Ik heb daar {action}.',f'Leuk! Was je om {returntime} weer thuis?']
    ann=f'Bedankt voor uw bezoek aan {place}. De bus terug vertrekt over tien minuten bij de hoofdingang. Controleer of u al uw spullen heeft. Volgende maand organiseren we weer een uitstapje. U kunt zich vanaf morgen aanmelden.'
    return case(uid,mode,'Over een uitstapje vertellen',doc,msg,q('Wat moet je zelf meenemen?','Eten en drinken.','Een stoel.','Een fiets.'),q('Wat wil je vriend de volgende keer?','Ook meegaan.','Thuis blijven.','De bus besturen.'),dialogue,ann,q('Waar vertrekt de bus terug?','Bij de hoofdingang.','Bij het station.','Achter de supermarkt.'),q('Waar is de persoon geweest?',place,'thuis','op kantoor'),('Responda ao amigo sobre o passeio.',['Diga aonde foi.','Conte uma atividade no passado.','Informe o horário de volta.'],f'Hoi, ik ben naar {place} gegaan. Ik heb daar {action}. Ik was om {returntime} terug. Het was leuk.'),('Conte oralmente como foi seu passeio fictício.',['Use uma forma de perfectum.','Diga o local e a atividade.','Comente como foi.'],f'Ik ben naar {place} gegaan en ik heb {action}. Ik vond het leuk en ik wil nog eens gaan.'),('Repasse as instruções da volta para outro passageiro.',['Informe em quanto tempo sai o ônibus.','Diga onde deve esperar.','Lembre de conferir os pertences.'],'O ônibus sai em dez minutos pela entrada principal. Precisamos conferir se estamos com todos os nossos pertences.'))
add('past','Experiências passadas','Descrever um passeio e compreender instruções de retorno.','bi-clock-history',past,[('Den Haag','zaterdag','een stadswandeling','18:00'),('Rotterdam','zondag','een rondvaart','19:00'),('Delft','vrijdag','een museumbezoek','17:30')],[('Perfectum','perfect-tense'),('Perguntas','questions-answers')])

def services(uid,mode,parcel,point,day,time):
    doc=f'Afhaalbericht\nPakketnummer: {parcel}\nAfhaalpunt: {point}\nAfhalen vanaf {day} om {time}.\nNeem uw identiteitsbewijs en dit bericht mee. Het pakket blijft zeven dagen liggen.'
    msg=f'Hallo, kun je mij helpen met een pakket? Ik heb een afhaalbericht ontvangen, maar ik weet niet wat ik moet meenemen. Wil je even met mij kijken?'
    dialogue=['Goedemiddag. Wat is het nummer van uw pakket?',f'Het pakketnummer is {parcel}. Is mijn pakket al bij {point}?',f'Ja, u kunt het vanaf {day} om {time} ophalen. Neem uw identiteitsbewijs mee.']
    ann=f'Beste klant. U kunt een pakket alleen ophalen met een geldig identiteitsbewijs en het afhaalbericht. Het afhaalpunt is vandaag tot zes uur open. Als iemand anders het pakket ophaalt, vraag ons dan eerst welke toestemming nodig is.'
    return case(uid,mode,'Een pakket ophalen',doc,msg,q('Hoe lang blijft het pakket liggen?','Zeven dagen.','Een maand.','Een dag.'),q('Waarmee wil de persoon hulp?','Met een afhaalbericht.','Met huiswerk.','Met een restaurantmenu.'),dialogue,ann,q('Hoe laat sluit het afhaalpunt vandaag?','18:00','06:00','20:00'),q('Wat moet je meenemen?','Een identiteitsbewijs.','Een boodschappenlijst.','Een treinkaartje.'),('Escreva ao ponto de retirada para esclarecer uma dúvida.',['Informe o número do pacote.','Diga quando pretende buscar.','Pergunte se outra pessoa pode retirar.'],f'Goedemiddag, mijn pakketnummer is {parcel}. Ik wil het {day} ophalen. Mag iemand anders het pakket voor mij ophalen?'),('Explique ao atendente o que veio fazer.',['Diga que vai buscar um pacote.','Informe o número.','Pergunte quais documentos apresentar.'],f'Goedemiddag, ik kom pakket {parcel} ophalen. Welke documenten moet ik laten zien?'),('Explique ao amigo como retirar a entrega.',['Diga quais documentos levar.','Informe o horário de fechamento.','Explique o que perguntar se outra pessoa for retirar.'],'É preciso levar identificação válida e a mensagem de retirada. Hoje fecha às seis. Para outra pessoa retirar, devemos perguntar antes qual autorização é necessária.'))
add('services','Serviços e entregas','Entender um aviso e solicitar esclarecimentos práticos.','bi-box-seam',services,[('4312','Boekwinkel De Brug','dinsdag','12:00'),('7251','Buurtwinkel Het Plein','vrijdag','10:00'),('9864','Servicepunt Noord','woensdag','14:00')],[('Números','numbers'),('Perguntas','questions-answers')])

def mixed(uid,mode,event,place,day,time,newplace):
    doc=f'Buurtactiviteit: {event}\nDag: {day}\nBegin: {time}\nLocatie: {place}\nToegang is gratis. Neem iets te drinken mee. Kinderen zijn welkom.'
    msg=f'Hoi, ik wil graag naar {event}. Ik kom met mijn kind. Weet je of ik moet betalen en wat ik moet meenemen?'
    dialogue=['Goedemiddag. Wilt u zich aanmelden voor de buurtactiviteit?',f'Ja, ik wil graag naar {event}. Kan mijn kind ook mee?',f'Ja, kinderen zijn welkom. We beginnen om {time}.']
    ann=f'Let op. De buurtactiviteit {event} gaat door, maar niet op de oude locatie. We ontmoeten elkaar vandaag bij {newplace}. Het begint om {time}. Deel deze verandering ook met mensen die dit bericht niet hebben gehoord.'
    return case(uid,mode,'Een verandering doorgeven',doc,msg,q('Moeten kinderen thuisblijven?','Nee, ze zijn welkom.','Ja, altijd.','Alleen op zondag.'),q('O que a pessoa quer saber?','Prijs en wat ze moet meenemen.','Het treinnummer.','De maat van een jas.'),dialogue,ann,q('Waar vindt de activiteit nu plaats?',newplace,place,'het ziekenhuis'),q('Wanneer begint de activiteit?',time,'23:00','06:00'),('Responda à mensagem com as informações atualizadas.',['Explique que é gratuito e crianças podem ir.','Informe o novo local e horário.','Diga para levar algo para beber.'],f'Hoi, de activiteit is gratis en kinderen zijn welkom. We gaan nu naar {newplace}, om {time}. Neem iets te drinken mee.'),('Peça informações e confirme sua participação.',['Diga de qual atividade quer participar.','Pergunte pelo novo local.','Confirme o horário.'],f'Goedemiddag, ik wil graag naar {event}. Waar is het nu? Begint het nog steeds om {time}?'),('Explique a mudança para um vizinho que não ouviu o recado.',['Diga qual atividade mudou.','Informe o novo local.','Confirme o horário.'],f'A atividade {event} mudou para {newplace}. Continua começando às {time}. Precisamos avisar os demais participantes.'))
add('mixed','Situações combinadas','Combinar leitura, escuta e comunicação para resolver um imprevisto.','bi-puzzle',mixed,[('de spelletjesmiddag','het buurthuis','zaterdag','14:00','de bibliotheek'),('de buurtlunch','het park','zondag','12:00','het wijkcentrum'),('de boekenmarkt','het plein','woensdag','15:00','de sporthal')],[('Revisão','questions-answers'),('Escuta','listening')])

Path('src/modules/a2/a2Content.json').write_text(json.dumps(units,ensure_ascii=False,indent=2)+'\n')
print(f'{len(units)} units, {sum(len(u["cases"]) for u in units)} cases generated')

# Add a second comprehension question and case-specific facts. Assessment variants
# must require information from their own source, rather than a memorised answer.
for unit in units:
 for index, material in enumerate(unit['cases']):
  uid=unit['id'];doc,msg=material['documents'];conv,ann=material['audios']
  code=material['id'];info=material['writing']['samples'][0]
  if uid=='transport':
   values=[('Leiden','09:10','2','4','15'),('Delft','14:20','3','6','10'),('Haarlem','18:05','5','8','20')][index];city,time,old,new,delay=values
   doc['questions'].append(q('Qual é o horário de partida no bilhete?',time,'11:45','22:15'))
   msg['questions'].append(q('Onde Noor estará esperando?',f'Bij de uitgang van station {city}.','Bij de uitgang van de supermarkt.','Bij de bioscoop.'))
   conv['questions'].append(q('Qual é o horário da viagem mencionada na conversa?',time,'07:00','23:30'))
   ann['questions'].append(q('Quantos minutos de atraso foram anunciados?',delay,'35','50'))
  elif uid=='contacts':
   time=['19:00','18:30','10:00'][index];day=['dinsdag','donderdag','zaterdag'][index]
   doc['questions'].append(q('Em qual dia ocorre o encontro?',day,'maandag','zondag'))
   msg['questions'].append(q('Onde a pessoa quer encontrar você?','Bij de ingang.','Op de derde verdieping.','Op het station.'))
   conv['questions'].append(q('O que as pessoas vão fazer juntas?','Naar het taalcafé gaan.','Naar de dokter gaan.','Een pakket ophalen.'))
   ann['questions'].append(q('A que horas começa?',time,'08:00','23:30'))
  elif uid=='appointments':
   time=['11:30','09:30','12:00'][index];day=['woensdag','vrijdag','zaterdag'][index]
   doc['questions'].append(q('Qual é o endereço?','Marktstraat 12.','Kerkstraat 20.','Stationsweg 5.'))
   msg['questions'].append(q('Qual é o novo dia proposto?',day,'zondag','donderdag'))
   conv['questions'].append(q('Qual é o novo horário oferecido?',time,'18:00','21:00'))
   ann['questions'].append(q('Você precisa levar algum objeto específico?','Nee.','Een stoel.','Een handdoek.'))
  elif uid=='home':
   hour=['18:00','17:00','16:30'][index];time=['09:00','13:00','15:30'][index]
   doc['text']=doc['text'].replace('18:00',hour)+f'\nBezoek van de monteur: {time}.'
   doc['questions'].append(q('Até que horas pode ligar para problemas urgentes?',hour,'23:00','06:00'))
   msg['questions'].append(q('Quem enviou a mensagem?','De buurvrouw.','De kapper.','De docent.'))
   conv['questions'].append(q('A que horas o profissional pode chegar?',time,'07:15','22:00'))
   ann['questions'].append(q('Você pode ficar na moradia durante o reparo?','Ja.','Nee.','Alleen buiten.'))
  elif uid=='shopping':
   price=['45','32','39'][index];size=['M','L','S'][index]
   floor=['eerste verdieping','tweede verdieping','begane grond'][index];close=['vijf','zes','vier'][index]
   ann['text']=ann['text'].replace('eerste verdieping',floor).replace('vijf uur',f'{close} uur');ann['segments'][0]['text']=ann['text']
   ann['questions'][0]=q('Onde fica o atendimento ao cliente?',f'Op de {floor} naast de lift.','Op de derde verdieping.','Buiten achter de winkel.')
   material['mediation']['samples']=[['Você precisa do recibo. O atendimento fica no primeiro andar, ao lado do elevador, e hoje funciona até as cinco.','Você precisa do recibo. O atendimento fica no segundo andar, ao lado do elevador, e hoje funciona até as seis.','Você precisa do recibo. O atendimento fica no térreo, ao lado do elevador, e hoje funciona até as quatro.'][index]]
   doc['questions'].append(q('Qual é o tamanho do produto?',size,'XL','XXL'))
   msg['questions'].append(q('A pessoa já usou a peça?','Nee.','Ja, een week.','Ja, een maand.'))
   conv['questions'].append(q('Qual é o preço informado?',price,'80','95'))
   ann['questions'].append(q('É necessário marcar um horário para a troca?','Nee.','Ja, een week van tevoren.','Alleen op maandag.'))
  elif uid=='restaurant':
   close=['21:00','20:30','22:00'][index]
   doc['questions'].append(q('A que horas fecha a cozinha?',close,'14:00','23:59'))
   msg['questions'].append(q('Para quantas pessoas deve pedir uma mesa?','Twee.','Zes.','Tien.'))
   conv['questions'].append(q('Qual pergunta o atendente faz sobre os pratos?','Of ze tegelijk mogen komen.','Of u een trein wilt nemen.','Of u morgen wilt werken.'))
   ann['questions'].append(q('O que deve fazer se chegar mais tarde?','Even bellen.','Niets doen.','Een jas kopen.'))
  elif uid=='health':
   call=['08:00 en 10:00','09:00 en 11:00','10:00 en 12:00'][index];room=['drie','vijf','twee'][index]
   doc['text']=doc['text'].replace('08:00 en 10:00',call)
   ann['text']=ann['text'].replace('kamer drie',f'kamer {room}');ann['segments'][0]['text']=ann['text']
   doc['questions'].append(q('Em qual intervalo deve ligar para marcar?',call,'18:00 en 20:00','22:00 en 23:00'))
   msg['questions'].append(q('Ao lado de qual estabelecimento fica o consultório?','De apotheek.','De bioscoop.','De boekwinkel.'))
   conv['questions'].append(q('Qual pedido a pessoa faz?','Een afspraak maken.','Een tafel reserveren.','Een jas ruilen.'))
   ann['questions'].append(q('Em qual sala trabalha o médico hoje?',room,'zes','acht'))
  elif uid=='work':
   room=['kamer twee','de kantine','zaal vier'][index]
   ann['text']+=f' Het overleg is in {room}.';ann['segments'][0]['text']=ann['text']
   doc['questions'].append(q('O que deve levar para a reunião?','Een notitieboek.','Een handdoek.','Een paspoort.'))
   msg['questions'].append(q('Depois de que horário o colega lê as mensagens?','15:00','08:00','23:00'))
   conv['questions'].append(q('Quando ocorre a reunião segundo a conversa?','Direct na de pauze.','Voor het ontbijt.','Na middernacht.'))
   ann['questions'].append(q('Qual é o local mencionado no anúncio?',room,'de supermarkt','het ziekenhuis'))
  elif uid=='study':
   pages=['eerste twee','volgende drie','laatste twee'][index];number=['drie','vier','vijf'][index]
   ann['text']=ann['text'].replace('eerste twee',pages).replace('drie vragen',f'{number} vragen');ann['segments'][0]['text']=ann['text']
   material['writing']['samples']=[s.replace('eerste twee',pages).replace('drie vragen',f'{number} vragen') for s in material['writing']['samples']]
   material['writing']['points'][1]=f'Diga para preparar {number} perguntas.'
   ann['questions'][0]=q('Quantas perguntas deve preparar?',number,'tien','geen')
   material['mediation']['samples']=[['Devemos ler as duas primeiras páginas e escrever três perguntas. Não precisamos entregar nada.','Devemos ler as próximas três páginas e escrever quatro perguntas. Não precisamos entregar nada.','Devemos ler as duas últimas páginas e escrever cinco perguntas. Não precisamos entregar nada.'][index]]
   doc['questions'].append(q('O que deve fazer antes da primeira aula?','Uw naam op de lijst schrijven.','Een trein reserveren.','Een pakket afhalen.'))
   msg['questions'].append(q('O que a pessoa quer saber?','Wat ze voor de volgende les moet doen.','Hoeveel de bus kost.','Wanneer de winkel sluit.'))
   conv['questions'].append(q('Por que a pessoa quer fazer o curso?','Om nieuwe dingen te kunnen doen.','Omdat de winkel dicht is.','Om een pakket te versturen.'))
   ann['questions'].append(q('É preciso entregar algo?','Nee.','Een heel boek.','Een paspoort.'))
  elif uid=='past':
   minutes=['tien','vijftien','twintig'][index]
   ann['text']=ann['text'].replace('tien minuten',f'{minutes} minuten');ann['segments'][0]['text']=ann['text']
   material['mediation']['points'][0]=f'Informe que sai em {minutes} minutos.'
   material['mediation']['samples']=[f'O ônibus sai em {["dez","quinze","vinte"][index]} minutos pela entrada principal. Precisamos conferir se estamos com todos os nossos pertences.']
   doc['questions'].append(q('A que horas sai o ônibus de ida?','09:00','12:00','22:00'))
   msg['questions'].append(q('Sobre qual período a mensagem pergunta?','Het uitstapje dat al is geweest.','De vergadering morgen.','Een cursus volgend jaar.'))
   conv['questions'].append(q('A conversa trata de uma atividade passada ou futura?','Een activiteit in het verleden.','Alleen een plan voor morgen.','Een afspraak volgende maand.'))
   ann['questions'].append(q('Em quantos minutos o ônibus de volta parte?',minutes,'dertig','zestig'))
  elif uid=='services':
   close=['zes','vijf','zeven'][index];number=['4312','7251','9864'][index]
   ann['text']=ann['text'].replace('zes uur',f'{close} uur');ann['segments'][0]['text']=ann['text']
   ann['questions'][0]=q('A que horas fecha hoje?',close,'vier','negen')
   material['mediation']['samples']=[f'É preciso levar identificação válida e a mensagem de retirada. Hoje fecha às {["seis","cinco","sete"][index]}. Para outra pessoa retirar, devemos perguntar antes qual autorização é necessária.']
   doc['questions'].append(q('Qual é o número do pacote?',number,'1111','2222'))
   msg['questions'].append(q('Qual informação a pessoa não sabe?','Wat ze moet meenemen.','Hoe ze heet.','Waar ze woont.'))
   conv['questions'].append(q('O pacote já está disponível no ponto de retirada?','Ja.','Nee, pas volgende maand.','Het pakket is kwijt.'))
   ann['questions'].append(q('Se outra pessoa for retirar, o que deve fazer?','Eerst vragen welke toestemming nodig is.','Niets vragen.','Een treinkaartje kopen.'))
  elif uid=='mixed':
   time=['14:00','12:00','15:00'][index]
   doc['questions'].append(q('Qual é o preço da entrada?','Gratis.','Tien euro.','Vijftig euro.'))
   msg['questions'].append(q('Quem vai junto com a pessoa?','Haar of zijn kind.','Een collega van de winkel.','Een dokter.'))
   conv['questions'].append(q('Qual informação o atendente confirma?','Dat kinderen welkom zijn.','Dat het evenement niet doorgaat.','Dat de entree duur is.'))
   ann['questions'].append(q('A que horas começa a atividade?',time,'08:00','23:00'))
  material['mediation']['source']=ann['text']
  # Distribute the new questions' answers across options as well.
  for source in [doc,msg,conv,ann]:
   for n,question in enumerate(source['questions']):
    if n==0:continue
    offset=int(hashlib.sha256(f'{uid}:{code}:{question["prompt"]}'.encode()).hexdigest()[:8],16)%len(question['options'])
    options=question['options'];question['options']=options[offset:]+options[:offset];question['correct']=(-offset)%len(options)
Path('src/modules/a2/a2Content.json').write_text(json.dumps(units,ensure_ascii=False,indent=2)+'\n')
