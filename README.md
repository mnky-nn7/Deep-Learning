## GitHub Pages 배포

- 배포 브랜치: `dev`
- 배포 워크플로: `.github/workflows/deploy.yml`
- 배포 주소: https://mnky-nn7.github.io/Deep-Learning/

GitHub 저장소의 **Settings → Pages → Build and deployment → Source**를
**GitHub Actions**로 설정합니다. `dev` 브랜치에 push하면 의존성 설치,
TypeScript 검사, Vite 빌드 후 GitHub Pages에 자동 배포합니다.
실행 결과와 실제 배포 주소는 **Actions → Deploy to GitHub Pages**에서 확인합니다.
별도 배포 토큰은 필요하지 않습니다.

로컬에서 배포 경로를 적용한 빌드를 확인하려면 다음 명령을 실행합니다.

```powershell
cd frontend
npm.cmd ci
npm.cmd run build -- --base=/Deep-Learning/
npm.cmd run preview
```

미리보기 주소는 `http://localhost:4173/Deep-Learning/`입니다.

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
