# 🧠 Best Minds Hackaton

| | |
| :--- | :--- |
| **Topic:** | Platforma educationala |
| **Application:** | **Vizimera** |

---

## ✨ Quick describe:

Aplicația este o **platformă educațională** bazată pe utilizarea **cardurilor vizuale** pentru a facilita înțelegerea și memorarea informațiilor. În loc să prezinte definițiile într-o formă exclusiv textuală, aplicația transformă conceptele complexe în reprezentări vizuale simple și ușor de înțeles.

Fiecare card conține **o definiție, o reprezentare vizuală și informații esențiale** despre conceptul studiat. Astfel, utilizatorul nu doar citește informația, ci o asociază cu o imagine, ceea ce poate facilita înțelegerea și memorarea acesteia.

Aplicația poate utiliza **inteligența artificială** pentru a genera automat carduri vizuale pornind de la definiții sau materiale de studiu. Utilizatorul poate învăța într-un mod interactiv, poate repeta cardurile și își poate urmări progresul.

Scopul principal al aplicației este de a transforma procesul tradițional de învățare într-o experiență **mai vizuală, interactivă și accesibilă**, reducând dificultatea de a înțelege și memora concepte abstracte.

---

## 🔄 Arhitecture:

```text
Book -> ParsingBook -> CardService -> LLM visual plan -> SVG cards
```
