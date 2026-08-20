"use client"
import { useMemo, useState } from "react"
import { questions as vatandaslikQuestions, type Question } from "@/lib/questions"
import { historyQuestions } from "@/lib/history-questions"
import { questions as cografyaQuestions } from "@/lib/cografya"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Check,
  X,
  RotateCcw,
  Shuffle,
  ChevronRight,
  ChevronLeft,
  Trophy,
  ListChecks,
  Scale,
  Landmark,
  Globe2,
  ArrowLeft,
} from "lucide-react"

type Screen = "subject" | "start" | "quiz" | "result"
type SubjectId = "vatandaslik" | "tarih" | "cografya"

const SUBJECTS: {
  id: SubjectId
  ad: string
  aciklama: string
  bank: Question[]
  icon: typeof Scale
}[] = [
  {
    id: "vatandaslik",
    ad: "Vatandaşlık",
    aciklama: "Hukukun temelleri, anayasa, yasama-yürütme-yargı ve daha fazlası",
    bank: vatandaslikQuestions,
    icon: Scale,
  },
  {
    id: "tarih",
    ad: "Tarih",
    aciklama: "İslam öncesi Türkler, Selçuklu, Osmanlı, Kurtuluş Savaşı ve inkılaplar",
    bank: historyQuestions,
    icon: Landmark,
  },
  {
    id: "cografya",
    ad: "Coğrafya",
    aciklama: "Türkiye coğrafyası: yer şekillereri, iklim, tarım, madenler, nüfus ve daha fazlası",
    bank: cografyaQuestions,
    icon: Globe2,
  },
]

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function Quiz() {
  const [screen, setScreen] = useState<Screen>("subject")
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | null>(null)
  const [shuffle, setShuffle] = useState(true)
  const [selectedKonu, setSelectedKonu] = useState<string>("Tümü")

  const [deck, setDeck] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [wrongPicks, setWrongPicks] = useState<number[]>([])
  const [solvedThisQuestion, setSolvedThisQuestion] = useState(false)
  const [solvedSet, setSolvedSet] = useState<Set<number>>(new Set())
  const [firstTryCorrect, setFirstTryCorrect] = useState(0)
  const [totalWrongClicks, setTotalWrongClicks] = useState(0)

  const activeSubject = SUBJECTS.find((s) => s.id === selectedSubject)
  const activeQuestions: Question[] = activeSubject?.bank ?? []

  const konular = useMemo(() => {
    const set = new Set<string>(activeQuestions.map((q) => q.konu))
    return ["Tümü", ...Array.from(set).sort((a, b) => a.localeCompare(b, "tr"))]
  }, [selectedSubject])

  const konuCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const q of activeQuestions) map.set(q.konu, (map.get(q.konu) ?? 0) + 1)
    return map
  }, [selectedSubject])

  function selectSubject(id: SubjectId) {
    setSelectedSubject(id)
    setSelectedKonu("Tümü")
    setScreen("start")
  }

  function startQuiz() {
    let pool = selectedKonu === "Tümü" ? activeQuestions : activeQuestions.filter((q) => q.konu === selectedKonu)
    if (shuffle) pool = shuffleArray(pool)
    setDeck(pool)
    setIndex(0)
    setWrongPicks([])
    setSolvedThisQuestion(false)
    setSolvedSet(new Set())
    setFirstTryCorrect(0)
    setTotalWrongClicks(0)
    setScreen("quiz")
  }

  const current = deck[index]

  function handlePick(optionIndex: number) {
    if (!current || solvedThisQuestion) return
    if (optionIndex === current.dogru) {
      if (wrongPicks.length === 0 && !solvedSet.has(index)) setFirstTryCorrect((n) => n + 1)
      setSolvedThisQuestion(true)
      setSolvedSet((prev) => new Set(prev).add(index))
    } else {
      if (!wrongPicks.includes(optionIndex)) {
        setWrongPicks((prev) => [...prev, optionIndex])
      }
      setTotalWrongClicks((n) => n + 1)
    }
  }

  function goToIndex(newIndex: number) {
    setIndex(newIndex)
    setWrongPicks([])
    setSolvedThisQuestion(solvedSet.has(newIndex))
  }

  function nextQuestion() {
    if (index + 1 >= deck.length) {
      setScreen("result")
      return
    }
    goToIndex(index + 1)
  }

  function prevQuestion() {
    if (index === 0) return
    goToIndex(index - 1)
  }

  // ---------- Ders seçim ekranı ----------
  if (screen === "subject") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 md:py-16">
        <header className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">Sınava Hazırlık</p>
          <h1 className="text-balance font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">
            KPSS Quiz
          </h1>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            Çalışmak istediğin dersi seç.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          {SUBJECTS.map((subject) => {
            const Icon = subject.icon
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => selectSubject(subject.id)}
                className="flex items-center gap-5 rounded-2xl border border-border bg-card p-6 text-left shadow-sm transition-all hover:border-primary hover:bg-accent"
              >
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="size-7 text-primary" aria-hidden />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-foreground">{subject.ad}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{subject.aciklama}</p>
                  <p className="mt-1 text-xs font-medium text-primary">{subject.bank.length} soru</p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ---------- Konu seçim ekranı ----------
  if (screen === "start") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 md:py-16">
        <header className="mb-8">
          <button
            type="button"
            onClick={() => setScreen("subject")}
            className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Ders seçimine dön
          </button>
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
            {activeSubject?.ad}
          </p>
          <h1 className="text-balance font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">
            Konu Seç
          </h1>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">{activeQuestions.length} soru</span> mevcut.
            Yanlış seçersen kırmızı olur ve doğruyu bulana kadar geçemezsin.
          </p>
        </header>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
          <div className="mb-5">
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ListChecks className="size-4 text-primary" aria-hidden />
              Konu seç
            </label>
            <div className="flex flex-wrap gap-2">
              {konular.map((konu) => {
                const count = konu === "Tümü" ? activeQuestions.length : (konuCounts.get(konu) ?? 0)
                const active = selectedKonu === konu
                return (
                  <button
                    key={konu}
                    type="button"
                    onClick={() => setSelectedKonu(konu)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/50",
                    )}
                  >
                    {konu}{" "}
                    <span className={cn("ml-1 tabular-nums", active ? "opacity-80" : "text-muted-foreground")}>
                      ({count})
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <label className="mb-6 flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3">
            <input
              type="checkbox"
              checked={shuffle}
              onChange={(e) => setShuffle(e.target.checked)}
              className="size-4 accent-[var(--primary)]"
            />
            <span className="flex items-center gap-2 text-sm text-foreground">
              <Shuffle className="size-4 text-primary" aria-hidden />
              Soruları karıştır
            </span>
          </label>

          <Button onClick={startQuiz} size="lg" className="w-full text-base">
            Sınava Başla
            <ChevronRight className="size-5" aria-hidden />
          </Button>
        </div>
      </div>
    )
  }

  // ---------- Sonuç ekranı ----------
  if (screen === "result") {
    const total = deck.length
    const pct = total > 0 ? Math.round((firstTryCorrect / total) * 100) : 0
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Trophy className="size-8 text-primary" aria-hidden />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Tamamladın!</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            {total} sorunun{" "}
            <span className="font-semibold text-foreground">{firstTryCorrect}</span> tanesini ilk
            denemede doğru bildin.
          </p>

          <div className="my-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-2xl font-bold tabular-nums text-primary">{pct}%</p>
              <p className="mt-1 text-xs text-muted-foreground">İlk deneme başarı</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-2xl font-bold tabular-nums text-foreground">{firstTryCorrect}</p>
              <p className="mt-1 text-xs text-muted-foreground">İlk seferde doğru</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-2xl font-bold tabular-nums text-foreground">{totalWrongClicks}</p>
              <p className="mt-1 text-xs text-muted-foreground">Toplam yanlış</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={startQuiz} size="lg" className="w-full">
              <RotateCcw className="size-4" aria-hidden />
              Tekrar Çöz
            </Button>
            <Button onClick={() => setScreen("start")} variant="outline" size="lg" className="w-full">
              Konu Değiştir
            </Button>
            <Button onClick={() => setScreen("subject")} variant="outline" size="lg" className="w-full">
              Ders Değiştir
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ---------- Quiz ekranı ----------
  if (!current) return null
  const progress = ((index + (solvedThisQuestion ? 1 : 0)) / deck.length) * 100

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 py-6 md:py-10">
      {/* Üst bilgi */}
       <div className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setScreen("subject")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Ana Menü
          </button>
          <span className="tabular-nums text-sm text-muted-foreground">
            {index + 1} / {deck.length}
          </span>
        </div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
            {current.konu}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Soru */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
        <h2 className="text-pretty font-serif text-lg font-bold leading-relaxed text-foreground md:text-xl">
          {current.soru}
        </h2>

        <div className="mt-5 flex flex-col gap-3">
          {current.secenekler.map((secenek, i) => {
            const isWrong = wrongPicks.includes(i)
            const isCorrect = solvedThisQuestion && i === current.dogru
            const disabled = solvedThisQuestion || isWrong

            return (
              <button
                key={i}
                type="button"
                onClick={() => handlePick(i)}
                disabled={disabled}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 text-left text-[15px] leading-relaxed transition-all",
                  "disabled:cursor-not-allowed",
                  isCorrect &&
                    "border-green-600 bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-100",
                  isWrong &&
                    "border-red-600 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100",
                  !isCorrect &&
                    !isWrong &&
                    "border-border bg-background text-foreground hover:border-primary hover:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                    isCorrect && "border-green-600 bg-green-600 text-white",
                    isWrong && "border-red-600 bg-red-600 text-white",
                    !isCorrect && !isWrong && "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {isCorrect ? (
                    <Check className="size-4" aria-hidden />
                  ) : isWrong ? (
                    <X className="size-4" aria-hidden />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span className="flex-1">{secenek}</span>
              </button>
            )
          })}
        </div>

        {/* Geri bildirim */}
        <div className="mt-4 min-h-6 text-sm">
          {solvedThisQuestion ? (
            <p className="flex items-center gap-1.5 font-medium text-green-700 dark:text-green-400">
              <Check className="size-4" aria-hidden />
              Doğru! Devam edebilirsin.
            </p>
          ) : wrongPicks.length > 0 ? (
            <p className="flex items-center gap-1.5 font-medium text-red-700 dark:text-red-400">
              <X className="size-4" aria-hidden />
              Yanlış, tekrar dene. Doğruyu bulana kadar geçemezsin.
            </p>
          ) : (
            <p className="text-muted-foreground">Bir seçenek işaretle.</p>
          )}
        </div>
      </div>

      {/* Alt butonlar */}
      <div className="mt-5 flex gap-3">
        <Button
          onClick={prevQuestion}
          disabled={index === 0}
          variant="outline"
          size="lg"
          className="text-base"
        >
          <ChevronLeft className="size-5" aria-hidden />
          Geri
        </Button>
        <Button
          onClick={nextQuestion}
          disabled={!solvedThisQuestion}
          size="lg"
          className="flex-1 text-base"
        >
          {index + 1 >= deck.length ? "Bitir" : "Sonraki Soru"}
          <ChevronRight className="size-5" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
