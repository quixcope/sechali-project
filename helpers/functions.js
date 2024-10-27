const { DateTime } = require("luxon");
import { IconXboxX } from "@tabler/icons-react";

const makeid = (size) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < (size || 8); i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

const logs = (status, name, date, lang, filename, users, type) => {
  let text = "";
  if (lang === "tr") {
    if (status === "newfile") {
      text = `${DateTime.fromISO(date).toFormat("dd-MM-yyyy")} tarihinde ${name} tarafından ${filename} isimli dosya yüklendi.`;
    } else if (status === "deletefile") {
      text = `${DateTime.fromISO(date).toFormat("dd-MM-yyyy")} tarihinde ${name} tarafından ${filename} isimli dosya silindi.`;
    } else if (status === "newuser") {
      text = `${name}, ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")} tarihinde operasyonu ${users} kişileriyle güncellemiştir.`;
    } else if (status === "vehicleinfo") {
      text = `${name} tarafından ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")} tarihinde araç bilgisi güncellenmiştir.`;
    } else if (status === "newnote") {
      text = `${name} tarafından ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")} tarihinde "${filename}" isimli bir not eklenmiştir.`;
    } else if (status === "operationfinished") {
      text = `${name} tarafından ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")} tarihinde operasyon sonlandırıldı`;
    } else if (status === "active") {
      text = `${name} tarafından ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")} tarihinde operasyon yeniden aktif edildi.`;
    } else if (status === "operationstarted") {
      text = `${name} tarafından ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")} tarihinde operasyon başlatıldı.`;
    } else if (status === "cardcolour") {
      text = `${name}, ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")} tarihinde operasyon kart rengini güncellemiştir.`;
    } else if (type === "vehicle") {
      text = `${filename ? `Plaka: ${filename} - ` : ""} Araç Konum Bilgisi, ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")} tarihinde ${name} tarafından ${status} şeklinde güncellendi`;
    } else if (status === "carrierinfo") {
      text = `Taşıyıcı Firma Bilgisi, ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")} tarihinde ${name} tarafından güncellendi`;
    } else {
      text = `${DateTime.fromISO(date).toFormat("dd-MM-yyyy")} tarihinde ${name} tarafından ${status} şeklinde güncellendi`;
    }
  } else {
    if (status === "newfile") {
      text = `${name} added new file in ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")}.`;
    } else if (status === "deletefile") {
      text = `${name} deleted ${filename} file in ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")}.`;
    } else if (status === "newuser") {
      text = `"${name} updated the operation with ${users} on ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")}."`;
    } else if (status === "vehicleinfo") {
      text = `${name} updated the operation vehicle information on ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")}."`;
    } else if (status === "newnote") {
      text = `${name} added a new note named "${filename}" on ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")}.`;
    } else if (status === "operationfinished") {
      text = `${name} terminated the operation on ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")}.`;
    } else if (status === "active") {
      text = `${name} reactivated the operation on ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")}.`;
    } else if (status === "operationstarted") {
      text = `"Operation initiated by ${name} on ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")}.`;
    } else if (status === "cardcolour") {
      text = `${name}, updated the operation card colour on ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")}.`;
    } else if (type === "vehicle") {
      text = `${filename ? `Plate: ${filename} - ` : ""} Vehicle Location Information was updated by ${name} as a ${status} on ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")}`;
    } else if (status === "carrierinfo") {
      text = `${name}, updated the carrier company information on ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")}.`;
    } else {
      text = `On ${DateTime.fromISO(date).toFormat("dd-MM-yyyy")}, ${name} updated it as ${status}`;
    }
  }
  return text;
};

const convertCurrency = (value, text) => {
  let currency =
    value === "usd"
      ? text
        ? "DOLAR"
        : "$"
      : value === "eur"
        ? text
          ? "EURO"
          : "€"
        : value === "gbp"
          ? text
            ? "STERLIN"
            : "£"
          : value === "try"
            ? text
              ? "TL"
              : "₺"
            : "";
  return currency;
};

const modalStyle = {
  overlayProps: { backgroundOpacity: 0.55, blur: 3 },
  removeScrollProps: { allowPinchZoom: true },
  transitionProps: {
    transition: "fade",
    duration: 200,
    timingFunction: "linear",
  },
  closeButtonProps: { icon: <IconXboxX size={20} stroke={1.5} /> },
};

const kvkkText = (lang) => {
  const text = {
    tr: [
      {
        header: `İletişim Aydınlatma Metni`,
        p1: `İşbu aydınlatma metni, veri sorumlusu sıfatıyla ÇAKIR GLOBAL LOJİSTİK
        SAN. VE TİC. A.Ş. (bundan sonra “ÇAKIR LOJİSTİK” olarak anılacaktır)
        tarafından 6698 sayılı Kişisel Verilerin Korunması Kanunu ve ilgili
        diğer mevzuat hükümleri kapsamında kişisel verilerinizin işlenmesi,
        saklanması ve aktarılması ile ilgili siz müşterilerimizi
        bilgilendirmek amacıyla hazırlanmıştır. Aşağıda belirttiğimiz kişisel
        verilerinizi her koşulda;`,
        li1: [
          `Hukuka ve dürüstlük kurallarına uygun olarak,`,
          `Paylaştığınız kişisel verilerin doğruluğunu ve en güncel halini
        koruyarak,`,
          `Belirli, açık ve hukuka uygun amaçlar için,`,
          `İşlenecekleri amaçla bağlantılı, sınırlı ve ölçülü olacak şekilde,`,
          `İlgili mevzuatta öngörülen veya işlendikleri amaç için gerekli olan
        süre kadar saklayarak işleyeceğimizi bildiririz.`,
        ],
        s1: `İşlenen Kişisel Verileriniz, İşleme Amaçları ve Hukuki Sebepleri`,
        p2: `ÇAKIR LOJİSTİK’in iş faaliyetleri kapsamında müşterilerimizin aşağıda
        yer alan verilerini toplamaktayız:`,
        s2: `Kimlik Bilgileri`,
        li2: [`Ad`, `Soyad`, `Tc Kimlik No`, `İmza`],
        p3: `Yürütülmesi, İletişim Faaliyetlerinin Yürütülmesi,
        Firma/Ürün/Hizmetlere Bağlılık Süreçlerinin Yürütülmesi, Müşteri
        İlişkileri Yönetimi Süreçlerinin Yürütülmesi, Müşteri Memnuniyetine
        Yönelik Aktivitelerin Yürütülmesi, Organizasyon ve Etkinlik Yönetimi,
        Talep/Şikayetlerin Takibi, Mal/Hizmet Satış Süreçlerinin Yürütülmesi,
        Sözleşme Süreçlerinin Yürütülmesi, Yetkili Kişi, Kurum ve Kuruluşlara
        Bilgi Verilmesi amacıyla ve 6698 sayılı Kanunun 5 maddesinde
        belirtilen veri sorumlusunun meşru menfaatleri için veri işlenmesinin
        zorunlu olması hukuki sebebine dayanılarak işlenmektedir.`,
        s3: `Kişisel Verilerin Toplanma Yöntemi`,
        p4: `Yukarıda belirtilen kimlik bilgileriniz web portalımız üzerinden
        elektronik ortamda tarafınızdan doldurulan Müşteri formu sırasında
        toplanmaktadır.`,
        s4: `İletişim Bilgileri `,
        li3: [
          `İş ve Cep Telefon No`,
          `E-posta adresi`,
          `Sosyal medya iletişim bilgisi`,
          `İşyeri unvanı ve adresi`,
        ],
        p5: `İletişim Faaliyetlerinin Yürütülmesi, Müşteri İlişkileri Yönetimi
        Süreçlerinin Yürütülmesi, İletişim Faaliyetlerinin Yürütülmesi, İş
        Faaliyetlerinin Yürütülmesi, Firma/Ürün/Hizmetlere Bağlılık
        Süreçlerinin Yürütülmesi, Müşteri Memnuniyetine Yönelik Aktivitelerin
        Yürütülmesi, Organizasyon ve Etkinlik Yönetimi, Talep/Şikayetlerin
        Takibi, Mal/Hizmet Satış Süreçlerinin Yürütülmesi, Sözleşme
        Süreçlerinin Yürütülmesi, Yetkili Kişi, Kurum ve Kuruluşlara Bilgi
        Verilmesi amacıyla ve 6698 sayılı Kanunun 5 maddesinde belirtilen veri
        sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması
        hukuki sebebine dayanılarak işlenmektedir.`,
        s5: `Kişisel Verilerin Toplanma Yöntemi`,
        p6: `Yukarıda belirtilen iletişim bilgileriniz web portalımız üzerinden
        elektronik ortamda tarafınızdan doldurulan müşteri formu sırasında
        toplanmaktadır.`,
        s6: `İşlem Güvenliği Bilgileri`,
        li4: ["Ip Adresi", "Browser Bilgisi"],
        p7: `ÇAKIR LOJİSTİK’e ait web portalında bulunan müşteri formunun kullanılması ile teklif talebinizin değerlendirilerek geri bildirim yapılabilmesi sırasında işlem güvenliği açısından Firma/Ürün/Hizmetlere Bağlılık Süreçlerinin Yürütülmesi, İletişim Faaliyetlerinin Yürütülmesi, Müşteri İlişkileri Yönetimi Süreçlerinin Yürütülmesi, Müşteri Memnuniyetine Yönelik Aktivitelerin Yürütülmesi, Talep / Şikayetlerin Takibi amacıyla ve 6698 sayılı Kanunun 5 maddesinde belirtilen kişisel hak ve özlüklere aykırı olmamak kaydıyla ve veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması hukuki sebebine dayanılarak işlenmektedir.`,
        s7: `Kişisel Verilerin Toplanma Yöntemi`,
        p8: `Yukarıda belirtilen işlem güvenliği verileriniz ÇAKIR LOJİSTİK’e ait web portalında bulunan müşteri formunun kullanılması ile teklif talebinizin değerlendirilerek geri bildirim yapılabilmesi için tarafınızdan doldurulan elektronik formlar vasıtasıyla toplanmaktadır. Diğer taraftan, https://cakirlojistik.com.tr portalımızda bulunan Instagram, Twitter, facebook ve LinkedIn isimli sosyal medya hesapları üzerinden ve çevrimiçi ziyaretçilerin site kullanım alışkanlıklarını takip etmeyi hedefleyen cookie (çerez) kullanılmaktadır.`,
        s8: `Müşteri İşlem Bilgileri`,
        li5: [
          `Sektör bilgisi,`,
          `Talep edilen hizmet bilgisi,`,
          `Müşteri sipariş numarası`,
        ],
        p9: `ÇAKIR LOJİSTİK’ e ait web portalında bulunan müşteri formunun kullanılması ile teklif talebinizin değerlendirilerek geri bildirim yapılabilmesi için ve geri bildirim talepleriniz sırasında sizlere daha iyi hizmet sunabilmek için Pazarlama ve Satış Faaliyetlerinin Yürütülmesi, Firma/Ürün/Hizmetlere Bağlılık Süreçlerinin Yürütülmesi, İletişim Faaliyetlerinin Yürütülmesi, Müşteri İlişkileri Yönetimi Süreçlerinin Yürütülmesi, Müşteri Memnuniyetine Yönelik Aktivitelerin Yürütülmesi, Talep / Şikayetlerin Takibi amacıyla ve 6698 sayılı Kanunun 5 maddesinde belirtilen kişisel hak ve özlüklere aykırı olmamak kaydıyla ve veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması hukuki sebebine dayanılarak işlenmektedir.`,
        s9: `Kişisel verilerinizi kimlere ve hangi amaçla aktarıyoruz?`,
        p10: `ÇAKIR LOJİSTİK olarak, faaliyetimizin yurt dışı dahil lojistik hizmetlerini kapsaması nedeniyle verinizin işlendiği süreç yurt dışı bağlantılı ise iş faaliyetlerimizin ve personelimizin yurt dışı görevlendirmeleri ve eğitim faaliyetlerinin yürütülmesi amacı ile gerekli teknik ve idari tedbirleri alarak, bu kişilerle ve süreçlerle sınırlı veriler Kanun’daki kurallara uygun olarak yurt dışındaki iştirakler, bağlı ortaklıklar, alt yükleniciler ve tedarikçiler ile ilgili ülkedeki mevzuat zorunlulukları durumunda yabancı kamu kurum ve kuruluşları ile paylaşılabilecektir.`,
        s10: `Kişisel verilerinizi ne kadar süre ile saklıyoruz?`,
        p11: `Kişisel verileriniz, kanunda veya ilgili mevzuatta verinin saklanması için bir süre belirlenmişse, söz konusu veri en az bu süre kadar saklanmak zorundadır. Kanunda veya ilgili mevzuatta bir süre öngörülmemişse; işlenme amaçlarıyla bağlantılı, sınırlı ve ölçülü olmak kaydıyla belirlenen makul sürelerce ve hakkınızdaki verinin işlenmesini gerektiren sebeplerin ortadan kalkmasına kadar muhafaza edebilecektir.`,
        s11: `Veri sahibi olarak haklarınız nelerdir?`,
        p12: `Kişisel verilerinizi işleyecek veri sorumlusu niteliğindeki şirketimizin iletişim bilgileri, her tür iletişiminiz, şikâyet ve başvuru haklarınız için aşağıda bilgilerinize sunulmuş olup, bu konuda mevzuatta yapılacak olan güncelleme ve değişiklikleri https://cakirlojistik.com.tr web portalımız üzerinden takip edebilirsiniz. Adres: Cevizli Mah. Zuhal Cad. No:46/1 Ritim İstanbul Sitesi A1 Blok-Ofis No: 364 Maltepe,İstanbul, Türkiye https://cakirlojistik.com.tr info@cakirlojistik.com.tr kvkk@cakirlojistik.com.tr  
        Tel: + 90 (372) 502 05 00
        Başvurularınıza cevap verebilmemiz için, kimlik ve iletişim bilgilerinizi aşağıda bulunan kvkk başvuru formunda tam ve açık olarak belirtmeniz gerekli olup, ayrıca aşağıdaki yollardan birisi ile şirketimize başvuru yapmış olmanız gerekmektedir:`,
        s12: `Veri sahibi olarak haklarınızı nasıl kullanabilirsiniz?`,
        p13: `Kişisel verilerinizi işleyecek veri sorumlusu niteliğindeki şirketimizin iletişim bilgileri, her tür iletişiminiz, şikâyet ve başvuru haklarınız için aşağıda bilgilerinize sunulmuş olup, bu konuda mevzuatta yapılacak olan güncelleme ve değişiklikleri https://cakirlojistik.com.tr web portalımız üzerinden takip edebilirsiniz. Adres: Cevizli Mah. Zuhal Cad. No:46/1 Ritim İstanbul Sitesi A1 Blok-Ofis No: 364 Maltepe,İstanbul, Türkiye https://cakirlojistik.com.tr info@cakirlojistik.com.tr kvkk@cakirlojistik.com.tr Tel: + 90 (372) 502 05 00 Başvurularınıza cevap verebilmemiz için, kimlik ve iletişim bilgilerinizi aşağıda bulunan kvkk başvuru formunda tam ve açık olarak belirtmeniz gerekli olup, ayrıca aşağıdaki yollardan birisi ile şirketimize başvuru yapmış olmanız gerekmektedir:`,
        li6: [
          `Yukarıda belirtilen adresimize başvuru formunun doldurularak kimlik teyitli olarak elden ve şahsen başvuru,`,
          `Noter vasıtasıyla bildirim,`,
          `İadeli taahhütlü posta ile başvuru,`,
          `Yukarıda bildirilen mail adreslerine yazılı olarak ve güvenli elektronik imza kullanılarak başvuru.`,
        ],
        s13: `İLETİŞİM BİLGİLERİ`,
        li7: [
          `Unvan: ${process.env.COMPANY}`,
          `Telefon Numarası: ${process.env.PHONE_NUMBER} `,
          `Adres: ${process.env.COMPANY_ADDRESS}`,
          `E-posta adresi: ${process.env.MAIL_ADDRESSES}`,
        ],
      },
    ],
    en: [
      {
        header: `Communication Clarification Text`,
        p1: `This clarification text has been prepared by ÇAKIR GLOBAL LOJİSTİK SAN. TİC. A.Ş. (hereinafter reffered to as ‘ÇAKIR LOGISTICS’) in its capacity as the data controller, in order to inform to you, our customers, about the processing, storage, and transfer of your personal data in accordance with the Law No. 6698 on the relevant legislation. Under all circumstansces, we process your personal data as specified below:`,
        li1: [
          `In compliance with the law and principles of integrity,`,
          `Ensuring that the personel data you share is accurate and kept up to date,`,
          `For specific, explicit, and legitimate purposes,`,
          `In an manner that is relevant, limited, and proportionate to the purposes for which they are processed,`,
          `Storing the forthe period required by the relevant legislation or fort he purpose for which they are processed.`,
        ],
        s1: `Your Processed Personal Data, Purposes of Processing, and Legal Grounds`,
        p2: `Within the scope of its business activities, ÇAKIR LOGISTICS collects the following data from our customers:`,
        s2: `Identification Information`,
        li2: [`Name`, `Surname`, `ID Number`, `Signature`],
        p3: `Identification information such as name, surname and signature is processed for he purposes of ensuring business continuity and conducting business activities, carriying out communication activities, managing proceses related to loyalty to the company/products/services, conducting customer relationship management processes, performing activities aimed at customer satisfaction, managing organization and events, tracking requests, complaints, conducting goods, service sales processes, conducting contract processes and providing information to authorized persons and organizations. This processing is based on the legal grounds of the necessity of data processing fort he legitimate interests of the data controller as specified in Article 5 of Law No. 6698.`,
        s3: `Method of Collecting Personel Data`,
        p4: `The identification information mentioned above is collected through the customer form you fill out electronically via our web portal.`,
        s4: `Contact Information`,
        li3: [
          `Work and mobile phone number`,
          `Email address`,
          `Social media contact information`,
          `Workplace title and address`,
        ],
        p5: `Communication activities, customer relationship management processes, conducting business activities, managing processes related to loyalty to the company/product/services, conducting activities aimed at customer satisfaction, managing organizations and events. Conducting goods-service sales processes, contract processes, providing information to autorized persons,institutions and organization are processed based on the legal grounds of the necessity of data processing for the legitimate interests of the data controller as specified in Article 5 of Law No. 6698.`,
        s5: `Personal Data Collection`,
        p6: `The contact information mantioned above is collected through the customer form you fill out via our web portal.`,
        s6: `Transaction Security ınformation`,
        li4: ["IP Address", "Browser Information"],
        p7: `With the use of the customer form on ÇAKIR LOGISTICS web portal, during the evaluation of your quotation request and providing feedback, transaction security is ensured. These processes related to loyalty to the company/products/sevices, conducting activities aimed at customer satisfaction and tracing requests complaints. These data processing activities are carried out based on the legal grounds of the necessity of data processing fot the legitimate interests of the data controller, provided that it does not violate personal rights and freedos as specified in Article 5 of Law No. 6698.`,
        s7: `Personal Data Collection`,
        p8: `Your transaction security data mentioned above is collected through electronic forms filled out by you
        to evaluate your quotation request and provide feedback via the customer form on ÇAKIR LOGISTICS web portal. On the other hand, social media accounts named Instagram, Twitter (X), Facebook and Linkedln on our website https://cakirlojistik.com.tr, as well as cookies aiming to track online visitors site usage habits are used.`,
        s8: `Customer Transaction Information`,
        li5: [
          `Sector information`,
          `Requested service information`,
          `Customer order number`,
        ],
        p9: `The utilization of the customer form on ÇAKIR LOGISTICS web portal for evaluating your quotation requests and providing feedback, as well as offer you better service during feedback requests, is processed for the execution of marketing and sales activities, processes related to loyalty to the company/products/services, conducting communication activities, managing customer relationships, conducting activities aimed at customer satisfaction and tracing requests complaints. This processing is conducted based on the legal grounds of the necessity of data processing for the legitimate interests of the data controller, provided that it does not violate personal rights and freedoms as specified in Article 5 of Law No.6698.`,
        s9: `Whom do we transfer your personal data to and for what puposes?`,
        p10: `As ÇAKIR LOGISTICS, due to the international scope of our logistics services, if the process involving
        your data is related to foreign connections, necessary technical and administrative measures are taken for the execution of our business activities and the assignment and training activities of our personnel abroad. In compliance with the rules in the Law, limited data concerning these individuals processes may be shared with foreign subsidiaries, affiliated companies, subcontractors and suppliers and if required by the  in the respective country, with foreign public institutions and organizations.`,
        s10: `For how long do we retain your personal data?`,
        p11: `If there is a period specified fort he retention of data in the law or relevant legislation, the data must be retained for at least that period. If no period is specified in the law or relevant legislation, the data may be retained for a reasonable period of time, limited and proportional to the purposes of processing and until the reasons requiring the processing of your data are eliminated.`,
        s11: `What are your rights as a data subject?`,
        p12: `You have the right to learn whether your personal data is being processed, to request information
        regarding your processed personal data, to learn the purpose of processing and whether it is used, to know the third parties to whom your personal data is transferred, to request the correction of your personal data if it is incorrect, to request the deletion or destruction of your personal data if the reasons requiring its processing no longer exist and to request that the actions taken upon your request for correction, deletion or destruction of personal data be notified to third parties to whom the personal data has been transferred. You also have the right to object to a decision made against you based solely on the analysis of your personal data through automated systems. ÇAKIR LOGISTICS will respond to requests made by the data subject in accordance with the procedure within a maximum of thirty days, depending on the natüre of the requests.`,
        s12: `How can you exercise your rights as a data owner?`,
        p13: `The contact information of our company, which is the data controller that will process your personal
        data, is provided below for all your communications, complaints and application rights. You can follow
        updates and changes in the legislation on this matter through our web portal at https://cakirlojistik.com.tr.
        Address: Cevizli Mahallesi Zuhal Caddesi No:46/1 Ritim İstanbul Site A1 Block-Office No:364 Maltepe,
        İstanbul, Türkiye Website: https://cakirlojistik.com.tr Email: info@cakirlojistik.com.tr - @cakirlojistik.com.tr Tel: +90 (372) 502 05 00 In order for us to respond to your applications, you must fully and clearly specify your identity and contact information in the KVKK application form provided below. Additionally, you must apply to our company through one of the following methods:`,
        li6: [
          `Submitting the completed application form in person to our address above, with identity
          verification,`,
          `Notification via notary,`,
          `Application via registered mail with return receip,`,
          `Written application to the email addresses provided above, using a secure electronic signature.`,
        ],
        s13: `CONTACT INFORMATION`,
        li7: [
          `Title:: ${process.env.COMPANY}`,
          `Phone Number: ${process.env.PHONE_NUMBER} `,
          `Address:: ${process.env.COMPANY_ADDRESS}`,
          `Email:: ${process.env.MAIL_ADDRESSES}`,
        ],
      },
    ],
  };

  const populateLi = (keyLi, index) => {
    let temp = [];
    const liItems = text[lang][index][keyLi];
    for (let i = 0; i < liItems.length; i++) {
      temp.push(<li key={`${keyLi}${i}`}>{liItems[i]}</li>);
    }
    return temp;
  };

  const populateDiv = () => {
    let temp = [];
    for (let i = 0; i < text[lang].length; i++) {
      temp.push(
        <div key={i}>
          <h2>{text[lang][i].header}</h2>
          <p style={{ textAlign: "justify" }}>{text[lang][i].p1}</p>
          <ul style={{ textAlign: "justify", marginLeft: 20 }}>
            {populateLi("li1", i)}
          </ul>
          <strong>{text[lang][i].s1}</strong>
          <p style={{ textAlign: "justify" }}>{text[lang][i].p2}</p>
          <strong>{text[lang][i].s2}</strong>
          <ul style={{ textAlign: "justify", marginLeft: 20 }}>
            {populateLi("li2", i)}
          </ul>
          <p style={{ textAlign: "justify" }}>{text[lang][i].p3}</p>
          <strong>{text[lang][i].s3}</strong>
          <p style={{ textAlign: "justify" }}>{text[lang][i].p4}</p>
          <strong>{text[lang][i].s4}</strong>
          <ul style={{ textAlign: "justify", marginLeft: 20 }}>
            {populateLi("li3", i)}
          </ul>
          <p style={{ textAlign: "justify" }}>{text[lang][i].p5}</p>
          <strong>{text[lang][i].s5}</strong>
          <p style={{ textAlign: "justify" }}>{text[lang][i].p6}</p>
          <strong>{text[lang][i].s6}</strong>
          <ul style={{ textAlign: "justify", marginLeft: 20 }}>
            {populateLi("li4", i)}
          </ul>
          <p style={{ textAlign: "justify" }}>{text[lang][i].p7}</p>
          <strong>{text[lang][i].s7}</strong>
          <p style={{ textAlign: "justify" }}>{text[lang][i].p8}</p>
          <strong>{text[lang][i].s8}</strong>
          <ul style={{ textAlign: "justify", marginLeft: 20 }}>
            {populateLi("li5", i)}
          </ul>
          <p style={{ textAlign: "justify" }}>{text[lang][i].p9}</p>
          <strong>{text[lang][i].s9}</strong>
          <p style={{ textAlign: "justify" }}>{text[lang][i].p10}</p>
          <strong>{text[lang][i].s10}</strong>
          <p style={{ textAlign: "justify" }}>{text[lang][i].p11}</p>
          <strong>{text[lang][i].s11}</strong>
          <p style={{ textAlign: "justify" }}>{text[lang][i].p12}</p>
          <strong>{text[lang][i].s12}</strong>
          <p style={{ textAlign: "justify" }}>{text[lang][i].p13}</p>
          <ul style={{ textAlign: "justify", marginLeft: 20 }}>
            {populateLi("li6", i)}
          </ul>
          <strong>{text[lang][i].s13}</strong>
          <ul style={{ textAlign: "justify", marginLeft: 20 }}>
            {populateLi("li7", i)}
          </ul>
        </div>
      );
    }
    return temp;
  };
  return populateDiv();
};

const formatDifference = (difference, t) => {
  const { days, hours, minutes } = difference;
  let time = "";
  if (days === 0) {
    if (hours === 0) {
      time = `${Math.floor(Math.abs(minutes))} ${t("minutesago")}.`;
    } else {
      time = `${Math.abs(hours)} ${t("hour")} ${Math.floor(Math.abs(minutes))} ${t("minutesago")}.`;
    }
  } else {
    time = `${Math.abs(days)} ${t("day")}, ${Math.abs(hours)} ${t("hour")}, ${Math.floor(
      Math.abs(minutes)
    )} ${t("minutesago")}.`;
  }
  return time;
};

const howManyItem = ({ items }) => {
  let temp = {};
  let numbers = [
    { key: "Zero", value: 0 },
    { key: "One", value: 1 },
    { key: "Two", value: 2 },
    { key: "Three", value: 3 },
    { key: "Four", value: 4 },
    { key: "Five", value: 5 },
    { key: "Six", value: 6 },
    { key: "Seven", value: 7 },
    { key: "Eight", value: 8 },
    { key: "Nine", value: 9 },
  ];
  for (let i = 0; i < items.length; i++) {
    if (!items[i].count) {
      if (items[i].data.length >= 10) {
        temp = {
          ...temp,
          [items[i].icon]: `PiNumberCircleNineBold`,
          [items[i].plusIcon]: true,
        };
      } else {
        const iconKey = numbers.find(
          (x) => x.value === items[i].data.length
        ).key;
        temp = {
          ...temp,
          [items[i].icon]: `PiNumberCircle${iconKey}Bold`,
          [items[i].plusIcon]: false,
        };
      }
    } else {
      if (items[i].count >= 10) {
        temp = {
          ...temp,
          [items[i].icon]: `PiNumberCircleNineBold`,
          [items[i].plusIcon]: true,
        };
      } else {
        const iconKey = numbers.find((x) => x.value === items[i].count).key;
        temp = {
          ...temp,
          [items[i].icon]: `PiNumberCircle${iconKey}Bold`,
          [items[i].plusIcon]: false,
        };
      }
    }
  }
  return temp;
};

module.exports = {
  makeid,
  modalStyle,
  logs,
  convertCurrency,
  kvkkText,
  formatDifference,
  howManyItem,
};
