/**
 * REDLINE — vehicle catalog.
 *
 * Stored as pipe-delimited rows to keep the payload small and hand-editable.
 * Columns: id|make|model|yearStart|yearEnd|body|country|drive|hp|engine|rarity|tags
 *
 * rarity 1..6 → COMMON, UNCOMMON, RARE, EPIC, LEGENDARY, GRAIL
 * yearEnd 0 means "still in production".
 */

const ROWS = `
camry|Toyota|Camry|1982|0|sedan|jp|fwd|203|2.5 I4|1|daily,commuter
corolla|Toyota|Corolla|1966|0|sedan|jp|fwd|169|2.0 I4|1|daily,commuter
rav4|Toyota|RAV4|1994|0|suv|jp|awd|203|2.5 I4|1|daily,crossover
highlander|Toyota|Highlander|2000|0|suv|jp|awd|295|3.5 V6|1|daily,crossover,family
sienna|Toyota|Sienna|1997|0|van|jp|awd|245|2.5 hybrid|1|daily,family
tacoma|Toyota|Tacoma|1995|0|truck|jp|4wd|278|2.4T I4|1|daily,workhorse
tundra|Toyota|Tundra|1999|0|truck|jp|4wd|389|3.4TT V6|2|workhorse
prius5|Toyota|Prius|2023|0|hatch|jp|fwd|194|2.0 hybrid|1|daily,hybrid,green
4runner|Toyota|4Runner|1984|0|suv|jp|4wd|278|2.4T I4|2|offroad,daily
civic11|Honda|Civic|2021|0|sedan|jp|fwd|158|2.0 I4|1|daily,commuter
accord|Honda|Accord|1976|0|sedan|jp|fwd|192|1.5T I4|1|daily,commuter
crv|Honda|CR-V|1995|0|suv|jp|awd|190|1.5T I4|1|daily,crossover
pilot|Honda|Pilot|2002|0|suv|jp|awd|285|3.5 V6|1|daily,family
odyssey|Honda|Odyssey|1994|0|van|jp|fwd|280|3.5 V6|1|daily,family
hrv|Honda|HR-V|2014|0|suv|jp|awd|158|2.0 I4|1|daily,crossover
altima|Nissan|Altima|1992|0|sedan|jp|fwd|188|2.5 I4|1|daily,commuter
rogue|Nissan|Rogue|2007|0|suv|jp|awd|201|1.5T I3|1|daily,crossover
sentra|Nissan|Sentra|1982|0|sedan|jp|fwd|149|2.0 I4|1|daily,commuter
frontier|Nissan|Frontier|1997|0|truck|jp|4wd|310|3.8 V6|2|workhorse
leaf|Nissan|Leaf|2010|0|hatch|jp|fwd|147|electric|2|ev,green
cx5|Mazda|CX-5|2012|0|suv|jp|awd|187|2.5 I4|1|daily,crossover
mazda3|Mazda|Mazda3|2003|0|hatch|jp|fwd|191|2.5 I4|1|daily,commuter
outback|Subaru|Outback|1994|0|wagon|jp|awd|182|2.5 H4|1|daily,wagon-life,boxer
forester|Subaru|Forester|1997|0|suv|jp|awd|180|2.5 H4|1|daily,crossover,boxer
crosstrek|Subaru|Crosstrek|2012|0|suv|jp|awd|182|2.5 H4|1|daily,crossover,boxer
outlander|Mitsubishi|Outlander|2001|0|suv|jp|awd|181|2.5 I4|1|daily,crossover
elantra|Hyundai|Elantra|1990|0|sedan|kr|fwd|147|2.0 I4|1|daily,commuter
palisade|Hyundai|Palisade|2018|0|suv|kr|awd|291|3.8 V6|1|daily,family
sportage|Kia|Sportage|1993|0|suv|kr|awd|187|2.5 I4|1|daily,crossover
telluride|Kia|Telluride|2019|0|suv|kr|awd|291|3.8 V6|1|daily,family
f150|Ford|F-150|1975|0|truck|us|4wd|400|3.5TT V6|1|workhorse,truck-life
f250|Ford|F-250 Super Duty|1999|0|truck|us|4wd|475|6.7 diesel V8|2|workhorse,diesel,truck-life
explorer|Ford|Explorer|1990|0|suv|us|awd|300|2.3T I4|1|daily,crossover
escape|Ford|Escape|2000|0|suv|us|awd|181|1.5T I3|1|daily,crossover
transit|Ford|Transit|1965|0|van|us|rwd|310|3.5 V6|1|workhorse,van-life
machfe|Ford|Mustang Mach-E|2021|0|suv|us|awd|480|electric|2|ev,green
silverado|Chevrolet|Silverado 1500|1998|0|truck|us|4wd|420|6.2 V8|1|workhorse,truck-life,v8
equinox|Chevrolet|Equinox|2004|0|suv|us|awd|175|1.5T I4|1|daily,crossover
tahoe|Chevrolet|Tahoe|1994|0|suv|us|4wd|355|5.3 V8|1|daily,family,v8
malibu|Chevrolet|Malibu|1964|0|sedan|us|fwd|160|1.5T I4|1|daily,commuter
bolt|Chevrolet|Bolt EV|2016|2023|hatch|us|fwd|200|electric|2|ev,green
sierra|GMC|Sierra 1500|1998|0|truck|us|4wd|420|6.2 V8|1|workhorse,truck-life,v8
yukon|GMC|Yukon|1991|0|suv|us|4wd|355|5.3 V8|1|daily,family,v8
ram1500|Ram|1500|1981|0|truck|us|4wd|395|5.7 HEMI V8|1|workhorse,truck-life,v8,hemi
pacifica|Chrysler|Pacifica|2016|0|van|us|awd|287|3.6 V6|1|daily,family
grandchero|Jeep|Grand Cherokee|1992|0|suv|us|4wd|293|3.6 V6|1|daily,crossover
renegade|Jeep|Renegade|2014|0|suv|us|awd|177|1.3T I4|1|daily,crossover
escalade|Cadillac|Escalade|1998|0|suv|us|4wd|420|6.2 V8|2|luxury,family,v8
navigator|Lincoln|Navigator|1997|0|suv|us|4wd|440|3.5TT V6|2|luxury,family
model3|Tesla|Model 3|2017|0|sedan|us|awd|455|electric|1|ev,green
modely|Tesla|Model Y|2020|0|suv|us|awd|456|electric|1|ev,green,crossover
models|Tesla|Model S|2012|0|sedan|us|awd|670|electric|2|ev,green,luxury
jetta|Volkswagen|Jetta|1979|0|sedan|de|fwd|158|1.5T I4|1|daily,commuter
atlas|Volkswagen|Atlas|2017|0|suv|de|awd|269|2.0T I4|1|daily,family
tiguan|Volkswagen|Tiguan|2007|0|suv|de|awd|184|2.0T I4|1|daily,crossover
bmw3g20|BMW|3 Series (G20)|2018|0|sedan|de|rwd|255|2.0T I4|1|daily,luxury
cclass|Mercedes-Benz|C-Class|1993|0|sedan|de|rwd|255|2.0T I4|1|daily,luxury
audia4|Audi|A4|1994|0|sedan|de|awd|261|2.0T I4|1|daily,luxury,quattro
xc90|Volvo|XC90|2002|0|suv|se|awd|295|2.0 SC+T I4|2|daily,family,luxury
minif56|Mini|Cooper|2001|0|hatch|uk|fwd|189|2.0T I4|1|daily,hot-hatch
fiat500m|Fiat|500|2007|0|micro|it|fwd|101|1.4 I4|2|daily,city
r1t|Rivian|R1T|2021|0|truck|us|awd|835|electric|2|ev,green,truck-life
cybertruck|Tesla|Cybertruck|2023|0|truck|us|awd|845|electric|3|ev,truck-life,weird
ae86|Toyota|AE86 Corolla Levin|1983|1987|coupe|jp|rwd|128|4A-GE 1.6 I4|4|jdm,80s,drift,touge
supra_a80|Toyota|Supra RZ (A80)|1993|2002|coupe|jp|rwd|320|2JZ-GTE 3.0TT I6|4|jdm,90s,turbo,tuner
supra_a70|Toyota|Supra Turbo (A70)|1986|1992|coupe|jp|rwd|232|7M-GTE 3.0T I6|3|jdm,80s,turbo
mr2_sw20|Toyota|MR2 Turbo (SW20)|1989|1999|coupe|jp|rwd|200|3S-GTE 2.0T I4|2|jdm,90s,turbo,mid-engine
celica_st205|Toyota|Celica GT-Four (ST205)|1994|1999|coupe|jp|awd|252|3S-GTE 2.0T I4|4|jdm,90s,rally,homologation,turbo
fj60|Toyota|Land Cruiser FJ60|1980|1987|offroad|jp|4wd|135|2F 4.2 I6|3|offroad,80s,overland
century|Toyota|Century (V12)|1997|2017|sedan|jp|rwd|276|1GZ-FE 5.0 V12|4|luxury,jdm,v12,weird
toyota2000gt|Toyota|2000GT|1967|1970|coupe|jp|rwd|150|3M 2.0 I6|6|jdm,classic,unicorn
gryaris|Toyota|GR Yaris|2020|0|hatch|jp|awd|268|G16E-GTS 1.6T I3|3|jdm,hot-hatch,rally,turbo,homologation
gr86|Toyota|GR86|2021|0|coupe|jp|rwd|228|2.4 H4|2|jdm,drift,boxer
mkvsupra|Toyota|GR Supra (A90)|2019|0|coupe|jp|rwd|382|B58 3.0T I6|2|jdm,turbo
lfa|Lexus|LFA|2010|2012|super|jp|rwd|553|1LR-GUE 4.8 V10|6|jdm,supercar,v10,unicorn
is300|Lexus|IS300 (Altezza)|2001|2005|sedan|jp|rwd|215|2JZ-GE 3.0 I6|2|jdm,tuner
ls400|Lexus|LS400|1989|1994|sedan|jp|rwd|250|1UZ-FE 4.0 V8|2|jdm,luxury,90s,v8
lc500|Lexus|LC500|2017|0|coupe|jp|rwd|471|2UR-GSE 5.0 V8|3|jdm,luxury,v8
r34|Nissan|Skyline GT-R (R34)|1999|2002|coupe|jp|awd|276|RB26DETT 2.6TT I6|5|jdm,90s,godzilla,turbo,unicorn
r32|Nissan|Skyline GT-R (R32)|1989|1994|coupe|jp|awd|276|RB26DETT 2.6TT I6|5|jdm,90s,godzilla,turbo
r33|Nissan|Skyline GT-R (R33)|1995|1998|coupe|jp|awd|276|RB26DETT 2.6TT I6|4|jdm,90s,godzilla,turbo
r35|Nissan|GT-R (R35)|2007|0|coupe|jp|awd|565|VR38DETT 3.8TT V6|3|jdm,godzilla,turbo
s15|Nissan|Silvia Spec-R (S15)|1999|2002|coupe|jp|rwd|247|SR20DET 2.0T I4|4|jdm,drift,turbo
s13|Nissan|240SX (S13)|1989|1994|coupe|jp|rwd|155|KA24DE 2.4 I4|2|jdm,drift,90s
z32|Nissan|300ZX Twin Turbo (Z32)|1990|1996|coupe|jp|rwd|300|VG30DETT 3.0TT V6|3|jdm,90s,turbo
z33|Nissan|350Z|2003|2009|coupe|jp|rwd|287|VQ35DE 3.5 V6|2|jdm,drift
figaro|Nissan|Figaro|1991|1991|coupe|jp|fwd|76|MA10ET 1.0T I4|4|jdm,weird,retro,kei-adjacent
pao|Nissan|Pao|1989|1991|hatch|jp|fwd|52|MA10S 1.0 I4|4|jdm,weird,retro
patrol60|Nissan|Patrol 60|1960|1980|offroad|jp|4wd|125|3.0 I6|3|offroad,overland,classic
nsx_na1|Honda|NSX (NA1)|1990|2005|super|jp|rwd|270|C30A 3.0 V6|5|jdm,supercar,mid-engine,90s
s2000|Honda|S2000 (AP1)|1999|2003|roadster|jp|rwd|240|F20C 2.0 I4|4|jdm,vtec,roadster
ek9|Honda|Civic Type R (EK9)|1997|2000|hatch|jp|fwd|182|B16B 1.6 I4|4|jdm,vtec,hot-hatch,90s
dc2|Honda|Integra Type R (DC2)|1995|2001|coupe|jp|fwd|195|B18C 1.8 I4|3|jdm,vtec,90s
eg6|Honda|Civic SiR (EG6)|1992|1995|hatch|jp|fwd|168|B16A 1.6 I4|3|jdm,vtec,hot-hatch,90s
crx_ef8|Honda|CR-X SiR (EF8)|1987|1991|hatch|jp|fwd|158|B16A 1.6 I4|3|jdm,vtec,80s
beat|Honda|Beat|1991|1996|roadster|jp|rwd|63|E07A 0.66 I3|4|jdm,kei,mid-engine,weird
fl5|Honda|Civic Type R (FL5)|2023|0|hatch|jp|fwd|315|K20C1 2.0T I4|3|jdm,hot-hatch,turbo
fk8|Honda|Civic Type R (FK8)|2017|2021|hatch|jp|fwd|306|K20C1 2.0T I4|3|jdm,hot-hatch,turbo
fd3s|Mazda|RX-7 (FD3S)|1992|2002|coupe|jp|rwd|276|13B-REW rotary|4|jdm,rotary,90s,turbo
fc3s|Mazda|RX-7 Turbo II (FC)|1986|1991|coupe|jp|rwd|200|13B-T rotary|4|jdm,rotary,80s,turbo
rx3|Mazda|RX-3 Savanna|1971|1978|coupe|jp|rwd|118|12A rotary|4|jdm,rotary,classic
na_miata|Mazda|MX-5 Miata (NA)|1989|1997|roadster|jp|rwd|116|B6ZE 1.6 I4|2|jdm,roadster,90s,autocross
nd_miata|Mazda|MX-5 Miata (ND)|2015|0|roadster|jp|rwd|181|2.0 I4|1|jdm,roadster,autocross
cosmo110|Mazda|Cosmo Sport 110S|1967|1972|coupe|jp|rwd|128|10A rotary|6|jdm,rotary,classic,unicorn
rx8|Mazda|RX-8|2003|2012|coupe|jp|rwd|232|13B-MSP rotary|2|jdm,rotary
22b|Subaru|Impreza 22B STI|1998|1998|coupe|jp|awd|276|EJ22G 2.2T H4|5|jdm,rally,boxer,turbo,unicorn
gdb|Subaru|Impreza WRX STI (GDB)|2002|2007|sedan|jp|awd|300|EJ257 2.5T H4|3|jdm,rally,boxer,turbo
bh5|Subaru|Legacy GT-B Wagon|1998|2003|wagon|jp|awd|276|EJ208 2.0TT H4|3|jdm,wagon-life,boxer,turbo
brz|Subaru|BRZ|2012|0|coupe|jp|rwd|228|FA24 2.4 H4|2|jdm,drift,boxer
svx|Subaru|SVX|1991|1997|coupe|jp|awd|230|EG33 3.3 H6|4|jdm,weird,90s,boxer
evo6tme|Mitsubishi|Lancer Evolution VI TME|1999|1999|sedan|jp|awd|276|4G63T 2.0T I4|5|jdm,rally,turbo,unicorn
evo9|Mitsubishi|Lancer Evolution IX|2005|2007|sedan|jp|awd|286|4G63T 2.0T I4|4|jdm,rally,turbo
gto_vr4|Mitsubishi|3000GT VR-4|1990|1999|coupe|jp|awd|320|6G72TT 3.0TT V6|2|jdm,90s,turbo
pajero_evo|Mitsubishi|Pajero Evolution|1997|1999|offroad|jp|4wd|276|6G74 3.5 V6|5|jdm,rally,dakar,offroad,unicorn
cappuccino|Suzuki|Cappuccino|1991|1998|roadster|jp|rwd|63|F6A 0.66T I3|4|jdm,kei,roadster,weird
jimny|Suzuki|Jimny (JB74)|2018|0|offroad|jp|4wd|101|K15B 1.5 I4|2|offroad,kei-adjacent,overland
az1|Autozam|AZ-1|1992|1994|coupe|jp|rwd|63|F6A 0.66T I3|5|jdm,kei,gullwing,weird,unicorn
copen|Daihatsu|Copen|2002|2012|roadster|jp|fwd|63|JB-DET 0.66T I4|4|jdm,kei,roadster
b13ser|Nissan|Sentra SE-R (B13)|1991|1994|sedan|jp|fwd|140|SR20DE 2.0 I4|3|jdm,90s,sleeper
e30m3|BMW|M3 (E30)|1986|1991|coupe|de|rwd|192|S14 2.3 I4|5|german,80s,dtm,homologation,unicorn
e36m3|BMW|M3 (E36)|1992|1999|coupe|de|rwd|286|S50 3.0 I6|2|german,90s,drift
e46m3|BMW|M3 (E46)|2000|2006|coupe|de|rwd|333|S54 3.2 I6|3|german,drift
e92m3|BMW|M3 (E92)|2007|2013|coupe|de|rwd|414|S65 4.0 V8|3|german,v8
e39m5|BMW|M5 (E39)|1998|2003|sedan|de|rwd|394|S62 4.9 V8|4|german,90s,v8,sleeper
e60m5|BMW|M5 (E60)|2005|2010|sedan|de|rwd|500|S85 5.0 V10|4|german,v10,sleeper
bmw2002|BMW|2002 tii|1971|1975|sedan|de|rwd|130|M10 2.0 I4|3|german,classic,70s
e31_850csi|BMW|850CSi (E31)|1992|1996|coupe|de|rwd|375|S70 5.6 V12|4|german,90s,v12,luxury
z8|BMW|Z8|1999|2003|roadster|de|rwd|394|S62 4.9 V8|5|german,roadster,v8,unicorn
i8|BMW|i8|2014|2020|coupe|de|awd|369|1.5T I3 hybrid|2|german,hybrid,green,weird
e28m5|BMW|M5 (E28)|1985|1988|sedan|de|rwd|282|S38 3.5 I6|5|german,80s,sleeper
190e_evo2|Mercedes-Benz|190E 2.5-16 Evo II|1990|1990|sedan|de|rwd|232|M102 2.5 I4|5|german,dtm,homologation,unicorn
300sl|Mercedes-Benz|300SL Gullwing|1954|1957|coupe|de|rwd|215|M198 3.0 I6|6|german,classic,gullwing,unicorn
w123|Mercedes-Benz|W123 300D|1976|1985|sedan|de|rwd|87|OM617 3.0 diesel I5|2|german,diesel,70s,indestructible
gwagen|Mercedes-Benz|G-Wagen (W463)|1990|2018|offroad|de|4wd|215|3.0 I6|2|german,offroad,luxury,overland
e63w211|Mercedes-Benz|E63 AMG (W211)|2006|2009|sedan|de|rwd|507|M156 6.2 V8|3|german,amg,v8,sleeper
sls|Mercedes-Benz|SLS AMG|2010|2014|super|de|rwd|563|M159 6.2 V8|4|german,amg,supercar,gullwing,v8
clkgtr|Mercedes-Benz|CLK GTR|1997|1999|super|de|rwd|604|6.9 V12|6|german,supercar,homologation,v12,unicorn
993turbo|Porsche|911 Turbo (993)|1995|1998|coupe|de|awd|402|3.6TT H6|5|german,aircooled,turbo,boxer,unicorn
964|Porsche|911 Carrera (964)|1989|1994|coupe|de|rwd|247|3.6 H6|4|german,aircooled,boxer
911sc|Porsche|911 SC (G-Body)|1978|1983|coupe|de|rwd|180|3.0 H6|4|german,aircooled,70s,boxer
996|Porsche|911 Carrera (996)|1998|2004|coupe|de|rwd|296|3.4 H6|2|german,boxer
gt3_997|Porsche|911 GT3 (997.2)|2009|2012|coupe|de|rwd|429|3.8 H6|4|german,track,boxer
carreragt|Porsche|Carrera GT|2004|2007|super|de|rwd|603|5.7 V10|6|german,supercar,v10,unicorn
p959|Porsche|959|1986|1993|super|de|awd|444|2.8TT H6|6|german,supercar,rally,turbo,unicorn
944turbo|Porsche|944 Turbo|1985|1991|coupe|de|rwd|217|2.5T I4|2|german,80s,turbo
gt4_981|Porsche|Cayman GT4 (981)|2015|2016|coupe|de|rwd|385|3.8 H6|4|german,track,mid-engine,boxer
p918|Porsche|918 Spyder|2013|2015|super|de|awd|887|4.6 V8 hybrid|6|german,hypercar,hybrid,v8,unicorn
taycan|Porsche|Taycan Turbo S|2019|0|sedan|de|awd|750|electric|2|german,ev,green
urquattro|Audi|Quattro (Ur)|1980|1991|coupe|de|awd|197|2.1T I5|5|german,rally,group-b,turbo,unicorn
rs2|Audi|RS2 Avant|1994|1995|wagon|de|awd|311|2.2T I5|5|german,wagon-life,turbo,unicorn
rs4b7|Audi|RS4 (B7)|2006|2008|sedan|de|awd|414|4.2 V8|3|german,v8,quattro
r8v10|Audi|R8 V10|2009|0|super|de|awd|525|5.2 V10|3|german,supercar,v10,mid-engine
ttmk1|Audi|TT (Mk1)|1998|2006|coupe|de|awd|225|1.8T I4|2|german,bauhaus,turbo
gti_mk1|Volkswagen|Golf GTI (Mk1)|1976|1983|hatch|de|fwd|110|1.8 I4|3|german,hot-hatch,70s
gti_mk2|Volkswagen|Golf GTI (Mk2)|1983|1992|hatch|de|fwd|139|1.8 16v I4|3|german,hot-hatch,80s
r32mk4|Volkswagen|Golf R32 (Mk4)|2002|2004|hatch|de|awd|237|3.2 VR6|4|german,hot-hatch,vr6
beetle1|Volkswagen|Beetle (Type 1)|1938|2003|coupe|de|rwd|53|1.6 H4|2|german,classic,aircooled,boxer
bus_t2|Volkswagen|Bus (T2)|1967|1979|van|de|rwd|65|1.8 H4|3|german,van-life,aircooled,classic
corrado|Volkswagen|Corrado VR6|1991|1995|coupe|de|fwd|178|2.9 VR6|3|german,90s,vr6
f40|Ferrari|F40|1987|1992|super|it|rwd|471|2.9TT V8|6|italian,supercar,turbo,poster-car,unicorn
f355|Ferrari|F355|1994|1999|super|it|rwd|375|3.5 V8|4|italian,supercar,90s,gated
f360|Ferrari|360 Modena|1999|2005|super|it|rwd|394|3.6 V8|3|italian,supercar
testarossa|Ferrari|Testarossa|1984|1996|super|it|rwd|390|4.9 F12|4|italian,supercar,80s,poster-car
f308|Ferrari|308 GTS|1975|1985|super|it|rwd|252|3.0 V8|4|italian,supercar,70s
f250gto|Ferrari|250 GTO|1962|1964|super|it|rwd|296|3.0 V12|6|italian,classic,v12,unicorn,holy-grail
laferrari|Ferrari|LaFerrari|2013|2018|super|it|rwd|949|6.3 V12 hybrid|6|italian,hypercar,v12,unicorn
countach|Lamborghini|Countach LP400|1974|1990|super|it|rwd|375|4.0 V12|6|italian,supercar,poster-car,v12,scissor,unicorn
diablo|Lamborghini|Diablo|1990|2001|super|it|awd|485|5.7 V12|5|italian,supercar,90s,v12,scissor
gallardo|Lamborghini|Gallardo|2003|2013|super|it|awd|493|5.0 V10|4|italian,supercar,v10
huracan|Lamborghini|Huracán|2014|0|super|it|awd|602|5.2 V10|3|italian,supercar,v10
miura|Lamborghini|Miura P400|1966|1973|super|it|rwd|345|3.9 V12|6|italian,classic,v12,unicorn
lm002|Lamborghini|LM002|1986|1993|offroad|it|4wd|444|5.2 V12|5|italian,offroad,v12,weird,unicorn
gta1600|Alfa Romeo|Giulia Sprint GTA|1965|1971|coupe|it|rwd|113|1.6 I4|5|italian,classic,racing,unicorn
duetto|Alfa Romeo|Spider Duetto|1966|1993|roadster|it|rwd|109|1.6 I4|2|italian,classic,roadster
alfa8c|Alfa Romeo|8C Competizione|2007|2010|super|it|rwd|444|4.7 V8|5|italian,supercar,v8,unicorn
giuliaqv|Alfa Romeo|Giulia Quadrifoglio|2016|0|sedan|it|rwd|505|2.9TT V6|3|italian,sleeper,turbo
integrale|Lancia|Delta HF Integrale Evo|1991|1994|hatch|it|awd|212|2.0T I4|5|italian,rally,hot-hatch,turbo,unicorn
stratos|Lancia|Stratos HF|1973|1978|super|it|rwd|190|2.4 V6|6|italian,rally,classic,unicorn
lancia037|Lancia|037 Stradale|1982|1983|super|it|rwd|205|2.0 SC I4|6|italian,rally,group-b,unicorn
fiat500n|Fiat|500 Nuova|1957|1975|micro|it|rwd|18|0.5 I2|2|italian,classic,city,weird
panda4x4|Fiat|Panda 4x4|1983|2003|hatch|it|4wd|48|1.0 I4|3|italian,offroad,weird,80s
mc12|Maserati|MC12|2004|2005|super|it|rwd|621|6.0 V12|6|italian,supercar,homologation,v12,unicorn
ghibli2|Maserati|Ghibli (AM115)|1966|1973|coupe|it|rwd|330|4.7 V8|4|italian,classic,v8
zondac12|Pagani|Zonda C12|1999|2011|super|it|rwd|542|7.0 V12|6|italian,hypercar,v12,unicorn
pantera|De Tomaso|Pantera|1971|1992|super|it|rwd|330|5.8 V8|4|italian,supercar,v8,70s
defender90|Land Rover|Defender 90|1990|2016|offroad|uk|4wd|122|2.5 diesel I4|2|british,offroad,overland,diesel
series3|Land Rover|Series III|1971|1985|offroad|uk|4wd|72|2.25 I4|3|british,offroad,classic,overland
rrclassic|Land Rover|Range Rover Classic|1970|1996|suv|uk|4wd|178|3.9 V8|2|british,offroad,luxury,v8
minicooper_s|Mini|Cooper S (Mk1)|1963|1971|micro|uk|fwd|76|1.3 I4|3|british,classic,rally,city
etype|Jaguar|E-Type Series 1|1961|1968|coupe|uk|rwd|265|4.2 I6|5|british,classic,poster-car,unicorn
xj220|Jaguar|XJ220|1992|1994|super|uk|rwd|542|3.5TT V6|5|british,supercar,90s,turbo,unicorn
xjs|Jaguar|XJS V12|1975|1996|coupe|uk|rwd|291|5.3 V12|2|british,v12,70s
db5|Aston Martin|DB5|1963|1965|coupe|uk|rwd|282|4.0 I6|6|british,classic,spy,unicorn
v8vantage|Aston Martin|V8 Vantage|2005|2017|coupe|uk|rwd|420|4.7 V8|3|british,v8
one77|Aston Martin|One-77|2009|2012|super|uk|rwd|750|7.3 V12|5|british,hypercar,v12,unicorn
mclarenf1|McLaren|F1|1992|1998|super|uk|rwd|618|6.1 V12|6|british,hypercar,v12,three-seat,unicorn,holy-grail
mclarenp1|McLaren|P1|2013|2015|super|uk|rwd|903|3.8TT V8 hybrid|6|british,hypercar,hybrid,unicorn
mclaren720|McLaren|720S|2017|0|super|uk|rwd|710|4.0TT V8|3|british,supercar,turbo
esprit_s1|Lotus|Esprit S1|1976|1981|super|uk|rwd|160|2.0 I4|4|british,wedge,70s,spy
elise_s1|Lotus|Elise S1|1996|2001|roadster|uk|rwd|118|1.8 I4|4|british,lightweight,track
caterham7|Caterham|Seven|1973|0|roadster|uk|rwd|125|1.6 I4|3|british,lightweight,track,weird
sagaris|TVR|Sagaris|2005|2006|coupe|uk|rwd|406|4.0 I6|5|british,weird,unicorn
contigt|Bentley|Continental GT|2003|0|coupe|uk|awd|552|6.0TT W12|2|british,luxury,w12
phantom7|Rolls-Royce|Phantom VII|2003|2016|sedan|uk|rwd|453|6.75 V12|3|british,luxury,v12
escortcos|Ford|Escort RS Cosworth|1992|1996|hatch|uk|awd|224|2.0T I4|5|british,rally,turbo,whale-tail,unicorn
sierracos|Ford|Sierra RS Cosworth|1986|1992|sedan|uk|rwd|204|2.0T I4|5|british,80s,touring-car,turbo,unicorn
mustang67|Ford|Mustang GT Fastback|1967|1968|coupe|us|rwd|320|4.7 V8|4|american,muscle,60s,v8,poster-car
terminator|Ford|Mustang SVT Cobra|2003|2004|coupe|us|rwd|390|4.6 SC V8|4|american,muscle,v8,supercharged
mustangs550|Ford|Mustang GT (S550)|2015|2023|coupe|us|rwd|460|5.0 Coyote V8|1|american,muscle,v8
fordgt05|Ford|GT|2005|2006|super|us|rwd|550|5.4 SC V8|5|american,supercar,v8,lemans,unicorn
bronco66|Ford|Bronco|1966|1977|offroad|us|4wd|205|4.7 V8|3|american,offroad,classic,v8,overland
c2vette|Chevrolet|Corvette Sting Ray (C2)|1963|1967|coupe|us|rwd|375|5.4 V8|4|american,classic,v8,poster-car
c5z06|Chevrolet|Corvette Z06 (C5)|2001|2004|coupe|us|rwd|405|5.7 LS6 V8|3|american,v8,track
c8vette|Chevrolet|Corvette Stingray (C8)|2020|0|super|us|rwd|495|6.2 LT2 V8|2|american,mid-engine,v8
z28_69|Chevrolet|Camaro Z/28|1969|1969|coupe|us|rwd|290|4.9 V8|4|american,muscle,60s,v8
belair57|Chevrolet|Bel Air|1957|1957|sedan|us|rwd|283|4.6 V8|4|american,classic,50s,v8,fins
elcaminoss|Chevrolet|El Camino SS 454|1970|1970|truck|us|rwd|450|7.4 V8|4|american,muscle,v8,weird
charger69|Dodge|Charger R/T|1969|1969|coupe|us|rwd|425|7.0 HEMI V8|4|american,muscle,60s,hemi,v8
vipergts|Dodge|Viper GTS|1996|2002|super|us|rwd|450|8.0 V10|4|american,supercar,v10,90s
hellcat|Dodge|Challenger Hellcat|2015|2023|coupe|us|rwd|707|6.2 SC HEMI V8|3|american,muscle,v8,hemi,supercharged
superbird|Plymouth|Superbird|1970|1970|coupe|us|rwd|425|7.0 HEMI V8|5|american,muscle,nascar,wing,hemi,unicorn
transam77|Pontiac|Firebird Trans Am|1977|1981|coupe|us|rwd|200|6.6 V8|3|american,muscle,70s,v8,screaming-chicken
aztek|Pontiac|Aztek|2001|2005|suv|us|fwd|185|3.4 V6|3|american,weird,cult
gnx|Buick|GNX|1987|1987|coupe|us|rwd|276|3.8T V6|5|american,muscle,80s,turbo,sleeper,unicorn
wrangleryj|Jeep|Wrangler YJ|1987|1995|offroad|us|4wd|180|4.0 I6|2|american,offroad,overland
grandwag|Jeep|Grand Wagoneer|1963|1991|suv|us|4wd|144|5.9 V8|3|american,offroad,woodgrain,v8
eldorado59|Cadillac|Eldorado Biarritz|1959|1959|sedan|us|rwd|345|6.4 V8|4|american,classic,50s,fins,v8
h1|Hummer|H1|1992|2006|offroad|us|4wd|195|6.5 diesel V8|4|american,offroad,military,diesel
delorean|DeLorean|DMC-12|1981|1983|coupe|us|rwd|130|2.8 V6|4|american,gullwing,80s,movie-car,weird
cobra427|Shelby|Cobra 427|1965|1967|roadster|us|rwd|425|7.0 V8|5|american,classic,racing,v8,unicorn
saleens7|Saleen|S7|2000|2009|super|us|rwd|550|7.0 V8|5|american,supercar,v8,unicorn
gremlin|AMC|Gremlin|1970|1978|hatch|us|rwd|150|5.0 V8|4|american,weird,70s,cult
r5turbo2|Renault|5 Turbo 2|1983|1986|hatch|fr|rwd|158|1.4T I4|5|french,rally,group-b,mid-engine,turbo,unicorn
cliowilliams|Renault|Clio Williams|1993|1995|hatch|fr|fwd|148|2.0 I4|4|french,hot-hatch,rally,90s
meganers|Renault|Mégane RS|2004|0|hatch|fr|fwd|296|1.8T I4|2|french,hot-hatch,turbo,track
p205gti|Peugeot|205 GTI 1.9|1986|1994|hatch|fr|fwd|128|1.9 I4|3|french,hot-hatch,80s
p205t16|Peugeot|205 T16|1984|1986|hatch|fr|awd|197|1.8T I4|5|french,rally,group-b,turbo,unicorn
citroends|Citroën|DS 21|1955|1975|sedan|fr|fwd|100|2.2 I4|4|french,classic,hydropneumatic,weird
2cv|Citroën|2CV|1948|1990|sedan|fr|fwd|29|0.6 H2|3|french,classic,weird,city
veyron|Bugatti|Veyron 16.4|2005|2015|super|fr|awd|987|8.0 QT W16|6|french,hypercar,w16,turbo,unicorn
chiron|Bugatti|Chiron|2016|2022|super|fr|awd|1479|8.0 QT W16|6|french,hypercar,w16,turbo,unicorn
a110_og|Alpine|A110 Berlinette|1961|1977|coupe|fr|rwd|138|1.6 I4|5|french,rally,classic,unicorn
a110_new|Alpine|A110|2017|0|coupe|fr|rwd|248|1.8T I4|3|french,lightweight,mid-engine,turbo
volvo240|Volvo|240 Wagon|1974|1993|wagon|se|rwd|114|2.3 I4|2|swedish,wagon-life,brick,indestructible
volvo850r|Volvo|850 R Wagon|1995|1997|wagon|se|fwd|240|2.3T I5|4|swedish,wagon-life,turbo,btcc,sleeper
p1800|Volvo|P1800|1961|1973|coupe|se|rwd|115|1.8 I4|4|swedish,classic
saab900t|Saab|900 Turbo|1978|1993|hatch|se|fwd|175|2.0T I4|4|swedish,turbo,weird,80s
koenigsegg|Koenigsegg|Jesko|2022|0|super|se|rwd|1600|5.0TT V8|6|swedish,hypercar,v8,unicorn
ioniq5n|Hyundai|IONIQ 5 N|2024|0|hatch|kr|awd|641|electric|4|korean,ev,green,track
velostern|Hyundai|Veloster N|2019|2022|hatch|kr|fwd|275|2.0T I4|2|korean,hot-hatch,turbo
stingergt|Kia|Stinger GT|2018|2023|sedan|kr|awd|368|3.3TT V6|2|korean,sleeper,turbo
g70|Genesis|G70|2017|0|sedan|kr|awd|365|3.3TT V6|2|korean,luxury,turbo
niva|Lada|Niva|1977|0|offroad|other|4wd|79|1.7 I4|4|soviet,offroad,weird,overland
trabant|Trabant|601|1963|1990|sedan|other|fwd|26|0.6 I2|4|soviet,weird,duroplast
gt40|Ford|GT40 Mk II|1966|1969|super|us|rwd|485|7.0 V8|6|american,lemans,racing,v8,unicorn,holy-grail
falconxb|Ford|Falcon XB GT|1973|1976|coupe|other|rwd|300|5.8 V8|5|australian,muscle,movie-car,v8,unicorn
hsvgtsr|Holden|HSV GTSR|2017|2017|sedan|other|rwd|577|6.2 SC V8|5|australian,muscle,v8,unicorn
`.trim();

const BODY_LABEL = {
  coupe: 'Coupe', sedan: 'Sedan', hatch: 'Hatchback', wagon: 'Wagon',
  suv: 'SUV', truck: 'Truck', van: 'Van', roadster: 'Roadster',
  super: 'Supercar', offroad: 'Off-Road', micro: 'City Car',
};

const COUNTRY = {
  jp: { name: 'Japan', flag: '🇯🇵' },
  de: { name: 'Germany', flag: '🇩🇪' },
  it: { name: 'Italy', flag: '🇮🇹' },
  uk: { name: 'United Kingdom', flag: '🇬🇧' },
  us: { name: 'United States', flag: '🇺🇸' },
  fr: { name: 'France', flag: '🇫🇷' },
  se: { name: 'Sweden', flag: '🇸🇪' },
  kr: { name: 'South Korea', flag: '🇰🇷' },
  other: { name: 'Elsewhere', flag: '🏁' },
};

const DRIVE_LABEL = { fwd: 'FWD', rwd: 'RWD', awd: 'AWD', '4wd': '4WD' };

export const RARITY = [
  null,
  { id: 1, key: 'common', name: 'Common', xp: 10, hue: 210, color: '#8b95a5', glow: 'rgba(139,149,165,.35)' },
  { id: 2, key: 'uncommon', name: 'Uncommon', xp: 25, hue: 150, color: '#3fd08a', glow: 'rgba(63,208,138,.35)' },
  { id: 3, key: 'rare', name: 'Rare', xp: 60, hue: 205, color: '#3fa9ff', glow: 'rgba(63,169,255,.4)' },
  { id: 4, key: 'epic', name: 'Epic', xp: 150, hue: 275, color: '#a874ff', glow: 'rgba(168,116,255,.45)' },
  { id: 5, key: 'legendary', name: 'Legendary', xp: 400, hue: 40, color: '#ffb43d', glow: 'rgba(255,180,61,.5)' },
  { id: 6, key: 'grail', name: 'Grail', xp: 1000, hue: 330, color: '#ff4d8d', glow: 'rgba(255,77,141,.55)' },
];

/** "1987–92" reads fine, but "1990–05" doesn't — keep all four digits across a century. */
function yearSpan(y0, y1) {
  if (!y1) return `${y0}–now`;
  if (y0 === y1) return `${y0}`;
  const short = Math.floor(y0 / 100) === Math.floor(y1 / 100);
  return `${y0}–${short ? String(y1).slice(2) : y1}`;
}

function parse(row) {
  const [id, make, model, y0, y1, body, country, drive, hp, engine, rarity, tags] = row.split('|');
  return {
    id,
    make,
    model,
    name: `${make} ${model}`,
    search: `${make} ${model} ${engine} ${tags}`.toLowerCase(),
    yearStart: +y0,
    yearEnd: +y1 || 0,
    years: yearSpan(+y0, +y1),
    decade: `${Math.floor(+y0 / 10) * 10}s`,
    body,
    bodyLabel: BODY_LABEL[body] || body,
    country,
    flag: (COUNTRY[country] || COUNTRY.other).flag,
    countryName: (COUNTRY[country] || COUNTRY.other).name,
    drive,
    driveLabel: DRIVE_LABEL[drive] || drive.toUpperCase(),
    hp: +hp,
    engine,
    rarity: +rarity,
    tags: tags ? tags.split(',') : [],
  };
}

export const CARS = ROWS.split('\n').map((r) => r.trim()).filter(Boolean).map(parse);
export const CARS_BY_ID = new Map(CARS.map((c) => [c.id, c]));
export const COUNTRIES = COUNTRY;
export const BODIES = BODY_LABEL;

/** Curated sets. `match` is evaluated against a car to determine membership. */
const SET_DEFS = [
  { id: 'jdm', name: 'JDM Legends', blurb: 'The cars that built the import scene.', match: (c) => c.tags.includes('jdm') && c.rarity >= 3 },
  { id: 'rotary', name: 'Rotary Club', blurb: 'No pistons. No apologies.', match: (c) => c.tags.includes('rotary') },
  { id: 'muscle', name: 'American Muscle', blurb: 'Displacement is a personality.', match: (c) => c.tags.includes('muscle') },
  { id: 'hothatch', name: 'Hot Hatch Heroes', blurb: 'Small car, big attitude.', match: (c) => c.tags.includes('hot-hatch') },
  { id: 'wagon', name: 'Wagon Life', blurb: 'Practicality, weaponised.', match: (c) => c.body === 'wagon' },
  { id: 'grail', name: 'Grail Hunt', blurb: 'Once-in-a-lifetime metal.', match: (c) => c.rarity === 6 },
  { id: 'rally', name: 'Rally Bred', blurb: 'Homologated for gravel.', match: (c) => c.tags.includes('rally') || c.tags.includes('group-b') },
  { id: 'aircooled', name: 'Air-Cooled', blurb: 'Cooled by the wind alone.', match: (c) => c.tags.includes('aircooled') },
  { id: 'kei', name: 'Kei Class', blurb: '660cc of pure joy.', match: (c) => c.tags.includes('kei') },
  { id: 'v12', name: 'Twelve Cylinders', blurb: 'The smoothest way to lose a licence.', match: (c) => c.tags.includes('v12') || c.tags.includes('w12') || c.tags.includes('w16') },
  { id: 'offroad', name: 'Overland', blurb: 'Pavement optional.', match: (c) => c.body === 'offroad' },
  { id: 'ev', name: 'Silent Running', blurb: 'The new normal.', match: (c) => c.tags.includes('ev') },
  { id: 'weird', name: 'Beautiful Oddities', blurb: 'Nobody knows why. Everybody loves them.', match: (c) => c.tags.includes('weird') },
  { id: 'poster', name: 'Bedroom Wall', blurb: 'You had this poster. Admit it.', match: (c) => c.tags.includes('poster-car') },
  { id: 'sleeper', name: 'Sleepers', blurb: 'Looks like nothing. Isn\'t.', match: (c) => c.tags.includes('sleeper') },
];

export const SETS = SET_DEFS.map((s) => {
  const members = CARS.filter(s.match).map((c) => c.id);
  return { id: s.id, name: s.name, blurb: s.blurb, members };
}).filter((s) => s.members.length >= 3);

export const SETS_BY_ID = new Map(SETS.map((s) => [s.id, s]));

/** Every set a given car belongs to. */
export function setsForCar(carId) {
  return SETS.filter((s) => s.members.includes(carId));
}
