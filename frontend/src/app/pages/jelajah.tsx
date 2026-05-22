import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Browse } from "../components/browse";
import { WordDetail } from "../components/word-detail";

export default function JelajahPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedWord, setSelectedWord] = useState<string | null>(
    searchParams.get("kata")
  );

  // Sync state dari URL param "kata"
  useEffect(() => {
    const kata = searchParams.get("kata");
    setSelectedWord(kata);
  }, [searchParams]);

  const handleSelectWord = (id: string) => {
    setSearchParams((p) => {
      p.set("kata", id);
      return p;
    });
  };

  const handleClose = () => {
    setSearchParams((p) => {
      p.delete("kata");
      return p;
    });
  };

  return (
    <>
      <Browse onSelectWord={handleSelectWord} />
      {selectedWord && (
        <WordDetail
          wordId={selectedWord}
          onClose={handleClose}
          onSelectWord={handleSelectWord}
        />
      )}
    </>
  );
}
