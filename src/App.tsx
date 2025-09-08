import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Star, Play, Trophy, Clock, Users, Code, Terminal, FileText, Zap, Database, Coffee } from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { SudokuGame } from './components/SudokuGame';
import { Game2048 } from './components/Game2048';
import { MinesweeperGame } from './components/MinesweeperGame';
import { MemoryGame } from './components/MemoryGame';
import { TetrisGame } from './components/TetrisGame';

const games = [
  {
    id: 'sudoku',
    name: '数独',
    description: '9x9のグリッドに1-9の数字を配置するロジックパズル',
    difficulty: ['初級', '中級', '上級'],
    category: 'ロジック',
    estimatedTime: '15-30分',
    component: SudokuGame
  },
  {
    id: '2048',
    name: '2048',
    description: '数字タイルを組み合わせて2048を目指すパズル',
    difficulty: ['初級', '中級', '上級'],
    category: 'スライディング',
    estimatedTime: '10-20分',
    component: Game2048
  },
  {
    id: 'minesweeper',
    name: 'マインスイーパー',
    description: '地雷を避けながら全てのマスを開けるパズル',
    difficulty: ['初級', '中級', '上級'],
    category: 'ロジック',
    estimatedTime: '5-15分',
    component: MinesweeperGame
  },
  {
    id: 'memory',
    name: 'メモリーゲーム',
    description: 'カードをめくって同じペアを見つけるゲーム',
    difficulty: ['初級', '中級', '上級'],
    category: '記憶',
    estimatedTime: '3-8分',
    component: MemoryGame
  },
  {
    id: 'tetris',
    name: 'テトリス風ブロック',
    description: '落ちてくるブロックを積み上げるパズル',
    difficulty: ['初級', '中級', '上級'],
    category: 'アクション',
    estimatedTime: '連続プレイ',
    component: TetrisGame
  }
];

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [activeTab, setActiveTab] = useState('games');

  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              onClick={() => setSelectedGame(null)}
              variant="outline"
              className="mb-4"
            >
              ← ゲーム一覧に戻る
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">{selectedGame.name}</h1>
                <p className="text-gray-600">{selectedGame.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span>難易度:</span>
                <div className="flex gap-2">
                  {selectedGame.difficulty.map(diff => (
                    <Button
                      key={diff}
                      size="sm"
                      variant={selectedDifficulty === diff ? "default" : "outline"}
                      onClick={() => setSelectedDifficulty(diff)}
                    >
                      {diff}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <GameComponent difficulty={selectedDifficulty} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                パズルゲーム & 開発ガイド
              </h1>
              <p className="text-gray-600">
                5種類のパズルゲームとWEB開発技術の学習サイト
              </p>
            </div>
            <div className="flex-shrink-0">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1684773585761-fde68b4ece42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXp6bGUlMjBnYW1lcyUyMGJyYWluJTIwdGVhc2luZyUyMGNvbG9yZnVsfGVufDF8fHx8MTc1NzIzNjQ4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Puzzle games"
                className="w-24 h-24 rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
              <TabsTrigger value="games" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                パズルゲーム
              </TabsTrigger>
              <TabsTrigger value="guide" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                開発ガイド
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="games" className="space-y-8">
            {/* Stats */}
            <section>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-semibold text-gray-900">5</div>
                  <div className="text-sm text-gray-600">ゲーム種類</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-semibold text-gray-900">15</div>
                  <div className="text-sm text-gray-600">難易度レベル</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-semibold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">いつでもプレイ</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-semibold text-gray-900">全年齢</div>
                  <div className="text-sm text-gray-600">対象</div>
                </div>
              </div>
            </section>

            {/* Games Grid */}
            <section>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">ゲーム一覧</h2>
                <p className="text-gray-600">お好みのパズルを選んでプレイしてください</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <Card key={game.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg">{game.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {game.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {game.description}
                      </p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {game.estimatedTime}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {game.difficulty.map((diff, index) => (
                              <div
                                key={diff}
                                className={`w-2 h-2 rounded-full ${
                                  index === 0 ? 'bg-green-400' : 
                                  index === 1 ? 'bg-yellow-400' : 'bg-red-400'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {game.difficulty.join(' • ')}
                          </span>
                        </div>
                        <Button
                          className="w-full group-hover:shadow-md transition-shadow"
                          onClick={() => setSelectedGame(game)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          プレイ開始
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="guide" className="space-y-8">
            {/* Development Guide */}
            <section>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">WEB開発技術ガイド</h2>
                <p className="text-gray-600">React、Python、Java、C、Vite、JSONの使い方と起動コマンド集</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* React Guide */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Code className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle>React.js</CardTitle>
                        <p className="text-sm text-gray-600">JavaScriptライブラリ</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">プロジェクト作成</h4>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                        npx create-react-app my-app<br />
                        cd my-app<br />
                        npm start
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">基本的なコンポーネント</h4>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                        function MyComponent() {`{`}<br />
                        &nbsp;&nbsp;return &lt;h1&gt;Hello React!&lt;/h1&gt;;<br />
                        {`}`}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">よく使うコマンド</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">npm start</code> - 開発サーバー起動</li>
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">npm run build</code> - ビルド</li>
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">npm test</code> - テスト実行</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Vite Guide */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle>Vite</CardTitle>
                        <p className="text-sm text-gray-600">高速ビルドツール</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">プロジェクト作成</h4>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                        npm create vite@latest my-app<br />
                        cd my-app<br />
                        npm install<br />
                        npm run dev
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">設定ファイル例</h4>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                        // vite.config.js<br />
                        export default {`{`}<br />
                        &nbsp;&nbsp;server: {`{ port: 3000 }`}<br />
                        {`}`}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">コマンド一覧</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code> - 開発サーバー</li>
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">npm run build</code> - 本番ビルド</li>
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">npm run preview</code> - ビルド確認</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Python Guide */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Terminal className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle>Python</CardTitle>
                        <p className="text-sm text-gray-600">プログラミング言語</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Webアプリ作成 (Flask)</h4>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                        pip install flask<br />
                        python app.py
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">基本的なFlaskアプリ</h4>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                        from flask import Flask<br />
                        app = Flask(__name__)<br />
                        <br />
                        @app.route('/')<br />
                        def hello():<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;return 'Hello World!'
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">よく使うコマンド</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">python -m venv venv</code> - 仮想環境作成</li>
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">source venv/bin/activate</code> - 仮想環境有効化</li>
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">pip install -r requirements.txt</code> - パッケージ一括インストール</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Java Guide */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Coffee className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle>Java</CardTitle>
                        <p className="text-sm text-gray-600">オブジェクト指向言語</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Spring Boot プロジェクト</h4>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                        ./mvnw spring-boot:run<br />
                        # または<br />
                        java -jar target/app.jar
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">基本的なController</h4>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                        @RestController<br />
                        public class HelloController {`{`}<br />
                        &nbsp;&nbsp;@GetMapping("/")<br />
                        &nbsp;&nbsp;public String hello() {`{`}<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;return "Hello World!";<br />
                        &nbsp;&nbsp;{`}`}<br />
                        {`}`}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Mavenコマンド</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">mvn compile</code> - コンパイル</li>
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">mvn test</code> - テスト実行</li>
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">mvn package</code> - パッケージ作成</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* C Language Guide */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Terminal className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <CardTitle>C言語</CardTitle>
                        <p className="text-sm text-gray-600">システムプログラミング</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">コンパイルと実行</h4>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                        gcc -o program main.c<br />
                        ./program
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">基本的なプログラム</h4>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                        #include &lt;stdio.h&gt;<br />
                        <br />
                        int main() {`{`}<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;printf("Hello World!\\n");<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;return 0;<br />
                        {`}`}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">コンパイルオプション</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">gcc -Wall</code> - 全警告表示</li>
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">gcc -g</code> - デバッグ情報付き</li>
                        <li>• <code className="bg-gray-100 px-2 py-1 rounded">gcc -O2</code> - 最適化</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* JSON Guide */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <CardTitle>JSON</CardTitle>
                        <p className="text-sm text-gray-600">データ交換フォーマット</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">基本的な構造</h4>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                        {`{`}<br />
                        &nbsp;&nbsp;"name": "太郎",<br />
                        &nbsp;&nbsp;"age": 25,<br />
                        &nbsp;&nbsp;"skills": ["React", "Python"]<br />
                        {`}`}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">JavaScriptでの操作</h4>
                      <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                        // 文字列からオブジェクトへ<br />
                        const obj = JSON.parse(jsonString);<br />
                        <br />
                        // オブジェクトから文字列へ<br />
                        const str = JSON.stringify(obj);
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">データ型</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>文字列</strong>: "hello"</li>
                        <li>• <strong>数値</strong>: 123, 45.67</li>
                        <li>• <strong>真偽値</strong>: true, false</li>
                        <li>• <strong>配列</strong>: [1, 2, 3]</li>
                        <li>• <strong>オブジェクト</strong>: {`{"key": "value"}`}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Additional Resources */}
            <section className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    WEBゲームサイト開発のステップ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-3">1. 企画・設計</h4>
                      <ul className="text-sm space-y-2 text-gray-600">
                        <li>• ゲームのルールとUI設計</li>
                        <li>• 技術スタック選択 (React, Vue, etc.)</li>
                        <li>• レスポンシブデザイン検討</li>
                        <li>• データ構造設計</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">2. 開発環境構築</h4>
                      <ul className="text-sm space-y-2 text-gray-600">
                        <li>• Node.js と npm/yarn インストール</li>
                        <li>• React/Vite プロジェクト作成</li>
                        <li>• CSS フレームワーク導入</li>
                        <li>• 開発サーバー起動確認</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">3. コア機能実装</h4>
                      <ul className="text-sm space-y-2 text-gray-600">
                        <li>• ゲームロジック実装</li>
                        <li>•状態管理 (useState, useEffect)</li>
                        <li>• イベントハンドリング</li>
                        <li>• スコア・タイマー機能</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">4. UI/UX改善</h4>
                      <ul className="text-sm space-y-2 text-gray-600">
                        <li>• アニメーション追加</li>
                        <li>• レスポンシブ対応</li>
                        <li>• アクセシビリティ改善</li>
                        <li>• パフォーマンス最適化</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">5. テスト・デプロイ</h4>
                      <ul className="text-sm space-y-2 text-gray-600">
                        <li>• 各種ブラウザでテスト</li>
                        <li>• モバイル端末でテスト</li>
                        <li>• ビルド・最適化</li>
                        <li>• Vercel/Netlify等にデプロイ</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">6. 公開・保守</h4>
                      <ul className="text-sm space-y-2 text-gray-600">
                        <li>• ドメイン設定</li>
                        <li>• SEO対策</li>
                        <li>• ユーザーフィードバック収集</li>
                        <li>• 継続的な改善</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">🧩 パズルゲーム & 開発ガイド</p>
            <p className="text-sm">ゲームで遊んで、技術を学ぼう</p>
          </div>
        </div>
      </footer>
    </div>
  );
}