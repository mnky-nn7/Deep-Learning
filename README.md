## 시작

```powershell
cd C:\Users\user\Desktop\Deep\frontend
npm install
npm run dev
```

> 위 경로는 프로젝트를 `Deep` 저장소의 `frontend` 폴더에 복사한 경우입니다.

## 기존 프로젝트에 적용

이미 Vite + React 프로젝트가 있다면 압축 파일의 다음 두 파일을 기존 프로젝트에 복사해 덮어쓰면 됩니다.

- `frontend/src/App.tsx`
- `frontend/src/App.css`

`frontend/src/main.tsx`가 `./App.css`를 import하는지 확인하세요. 또는 기존 `main.tsx`에서 CSS import를 추가하면 됩니다.

`package.json`과 `index.html`은 프로젝트를 새로 구성할 때 사용하는 예시입니다. 기존 프로젝트를 유지하려면 덮어쓰지 마세요.

## 주요 기능

- 선형회귀 그래프: 데이터 점 및 예측 직선 표시
- Cost Function: 기울기 a에 따른 오차제곱합을 곡선으로 표시
- 그래프 클릭으로 데이터 추가
- 데이터 표에서 x, y 직접 수정
- 데이터 추가/삭제, 기본값 복원
- 슬라이더로 기울기 a 직접 조절
- Learn / Stop / Reset: 경사하강법 반복 학습
- 학습률 조절
- 최소제곱법의 해석적 해 바로 구하기

## 사용된 수식

데이터 n개에 대해 i = 0, ..., n-1로 합산합니다. 직선은 절편 없이 원점을 지납니다.

- 예측: `h(x) = a*x`
- 오차제곱합: `S(a) = Σ(a*x_i-y_i)^2`
- 미분: `S'(a) = 2*Σ((a*x_i-y_i)*x_i)`
- 경사하강법: `a -= learningRate * S'(a)`
- 최소제곱해: `a = Σ(x_i*y_i) / Σ(x_i^2)`
- 모든 x가 0이면 비용은 a와 무관하므로 기울기를 하나로 결정할 수 없습니다.
