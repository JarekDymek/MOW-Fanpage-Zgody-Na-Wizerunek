# MOW Fanpage – Zgody LAB

Niezależny prototyp przyszłego modułu zgód dla aplikacji MOW Fanpage.

## Cel wersji 0.1

- testowanie hipotetycznej bazy wychowanków i osób dorosłych,
- modelowanie statusów zgód bez używania realnych danych,
- sprawdzanie zgód zbiorczo wg grupy,
- ręczne dodawanie wyjątków,
- wynik: OK / wymaga moderatora / blokada,
- historia testów,
- brak rozpoznawania twarzy i brak wysyłania zdjęć.

## Ważne

To jest LAB. Nie wpisuj realnych danych wychowanków przed zatwierdzeniem przez administratora danych/IOD: zakresu danych, podstaw prawnych, retencji, dostępu, infrastruktury i oceny ryzyka/DPIA.

## Docelowa architektura

1. Dokument źródłowy (papier/e-dokument) pozostaje poza aplikacją operacyjną.
2. Rejestr przechowuje tylko minimalny zestaw danych potrzebny do weryfikacji.
3. Zgoda jest wersjonowana: numer dokumentu + wersja formularza + okres + kanały.
4. Sprzeciw wychowanka jest odrębnym sygnałem blokującym/eskalującym.
5. Brak wpisu nigdy nie oznacza zgody.
6. Wychowawca nie edytuje podstaw zgody; tylko odczytuje i używa do weryfikacji zdjęcia.
7. Moderator ma historię decyzji i migawkę stanu zgód przy publikacji.
8. Brak automatycznego rozpoznawania twarzy.

## Uruchomienie

```bash
npm install
npm run dev
```

Testy:

```bash
npm test
npm run build
```
