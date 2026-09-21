import { useState, useEffect, useRef } from "react";
import './App.css';

type Memo = {
    id: number;
    title: string;
    text: string;
    createdAt: string;
}

function App() {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [memos, setMemos] = useState<Memo[]>(() => {
        const saved = localStorage.getItem('memos');
        return saved ? JSON.parse(saved) : [];
    });
    const [openId, setOpenId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        localStorage.setItem('memos', JSON.stringify(memos));
    }, [memos]);

    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (listRef.current && !listRef.current.contains(e.target as Node)) {
                setOpenId(null);
            }
        };
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick)
        };
    }, []);

    const handleSave = () => {
        if (text.trim() === '') return;

        if (editingId !== null) {
            setMemos(
                memos.map((memo) =>
                    memo.id === editingId
                    ? { ...memo, title: title.trim() === '' ? '無題' : title, text }
                    : memo
                )
            );
            setEditingId(null);
        } else {
          const newMemo: Memo = {
            id: Date.now(),
            title: title.trim() === '' ? '無題' : title,
            text,
            createdAt: new Date().toLocaleString('ja-JP'),
          };
          setMemos([...memos, newMemo]);
        };

        setTitle('');
        setText('');
    };

    const handleDelete = (id: number) => {
        setMemos(memos.filter((memo) => memo.id !== id));
        if (editingId === id) {
            setEditingId(null);
            setTitle('');
            setText('');
        }
    };

    const handleToggle = (id: number) => {
        setOpenId(openId === id ? null : id);
    };

    const handleEditStart = (memo: Memo) => {
        setEditingId(memo.id);
        setTitle(memo.title);
        setText(memo.text);
    };

    const highlightText = (source: string, query: string) => {
        if (query.trim() === '') return source;

        const regex = new RegExp(`(${query})`, 'gi');
        const parts = source.split(regex);

        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark key={i}>{part}</mark>
            ) : (
                part
            )
        );
    };

    const filteredMemos = memos.filter((memo) =>
        memo.title.toLowerCase().includes(searchQuery.toLocaleLowerCase()) ||
        memo.text.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="app">
            <h1>メモ帳</h1>
            <div className="editor">
                <input
                    className="title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="タイトルを入力"
                />
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    placeholder="メモを入力"
                />
                <div className="editor-footer">
                    <span className="char-count">{text.length}文字</span>
                    <button className="save-btn" onClick={handleSave}>
                        {editingId !== null ? '更新' : '保存'}
                    </button>
                </div>
            </div>

            <input
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="検索"
            />

            <ul className="memo-list" ref={listRef}>
                {filteredMemos.map((memo) => (
                    <li 
                        className="memo-item" 
                        key={memo.id}
                        onClick={() => handleToggle(memo.id)}
                    >
                        <div className="memo-row">
                            <span className="memo-title">{highlightText(memo.title, searchQuery)}</span>
                            <div className="memo-actions">
                                <button
                                    className="edit-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditStart(memo);
                                    }}
                                >
                                    編集
                                </button>
                                <button 
                                    className="delete-btn" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(memo.id);
                                    }}
                                >
                                    削除
                                </button>
                            </div>
                        </div>
                        {(openId === memo.id || searchQuery.trim() !== '' ) && (
                            <div className="memo-body">
                                <p className="memo-text">{highlightText(memo.text, searchQuery)}</p>
                                <div className="memo-date">{memo.createdAt}</div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;