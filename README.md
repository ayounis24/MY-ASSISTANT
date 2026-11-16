# مساعدي — My Assistant

تطبيق موبايل شخصي (Android و iOS) مبني بـ Expo و React Native، بيساعدك في:

- **✅ المهام والتذكيرات**: أضف مهمة بعنوان وتفاصيل وأولوية (عالية/متوسطة/منخفضة) وميعاد، وفعّل إشعار يفكّرك في الميعاد. فلترة حسب: اليوم، كل المهام، المتأخرة، المكتملة. لو ضغطت على الإشعار بيفتح المهمة على طول.
- **📝 الملاحظات واليوميات**: اكتب ملاحظات أو يوميات بتتحفظ تلقائي، ثبّت المهم منها 📌، ودوّر فيها بالبحث.

كل البيانات بتتخزن على الموبايل نفسه (AsyncStorage) — من غير حساب ولا سيرفر. الواجهة بالعربي ومن اليمين للشمال، وبتدعم الوضع الليلي.

## التشغيل

```bash
npm install
npx expo start
```

بعدها امسح الـ QR code بتطبيق **Expo Go** على موبايلك (من Google Play أو App Store).

> الإشعارات المحلية (التذكيرات) بتشتغل في Expo Go.

## تنزيله على الآيفون كتطبيق عادي (EAS)

المشروع متجهز بـ `eas.json`. البناء بيتم على سيرفرات Expo، فمش محتاج ماك.

**المطلوب مرة واحدة:**
1. حساب مجاني على [expo.dev](https://expo.dev).
2. حساب [Apple Developer](https://developer.apple.com/programs/) مدفوع (حوالي 99$ في السنة).
3. تسجيل الدخول: `npx eas-cli@latest login`، وبعدها `npx eas-cli@latest init` عشان يربط المشروع بحسابك.

**الطريقة المقترحة: TestFlight**
```bash
npm run release:ios
```
الأمر ده بيبني التطبيق ويرفعه على App Store Connect. أول مرة هيسألك عن حساب Apple وهيعمل الشهادات لوحده (اختار Yes في كل الأسئلة).
بعدها افتح App Store Connect، وضيف نفسك كـ tester في TestFlight، ونزّل التطبيق من تطبيق **TestFlight** على الآيفون.
لما تحب تطلّع نسخة جديدة، شغّل الأمر ده تاني. رقم البناء بيزيد لوحده.

**طريقة تانية: تنزيل مباشر (Ad Hoc)**
```bash
npm run register:device     # افتح اللينك من الآيفون عشان تسجّله
npm run build:ios:preview   # بعد ما يخلص، افتح اللينك من الآيفون ونزّل التطبيق
```

| الأمر | بيعمل إيه |
|---|---|
| `npm run release:ios` | بناء + رفع على TestFlight |
| `npm run build:ios` | بناء نسخة App Store بس |
| `npm run submit:ios` | رفع آخر بناء على App Store Connect |
| `npm run build:ios:preview` | بناء للتنزيل المباشر على أجهزة مسجلة |

معرّف التطبيق (Bundle ID) هو `com.ayounis24.myassistant`. لو Apple قالت إنه محجوز، غيّره في `app.json`.

## هيكل المشروع

```
src/
  app/                 # الشاشات (Expo Router)
    (tabs)/index.tsx   # شاشة المهام
    (tabs)/notes.tsx   # شاشة الملاحظات
    task/[id].tsx      # إضافة/تعديل مهمة
    note/[id].tsx      # إضافة/تعديل ملاحظة
  components/ui.tsx    # مكونات الواجهة (RTL)
  lib/
    store.tsx          # حالة التطبيق والتخزين
    notifications.ts   # جدولة التذكيرات
    dates.ts, theme.ts, types.ts
```

## أوامر مفيدة

```bash
npm run typecheck   # فحص TypeScript
```
