import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/context/AuthContext.tsx");import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=77e46f95"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("C:/Users/ashwi/OneDrive/Desktop/CampusMart/src/context/AuthContext.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$(), _s2 = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=77e46f95"; const React = __vite__cjsImport3_react.__esModule ? __vite__cjsImport3_react.default : __vite__cjsImport3_react; const createContext = __vite__cjsImport3_react["createContext"]; const useContext = __vite__cjsImport3_react["useContext"]; const useEffect = __vite__cjsImport3_react["useEffect"]; const useState = __vite__cjsImport3_react["useState"]; const ReactNode = __vite__cjsImport3_react["ReactNode"];
import { supabase } from "/src/lib/supabase.ts";
const AuthContext = createContext(void 0);
export const AuthProvider = ({ children }) => {
  _s();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session2) => {
      setSession(session2);
      setUser(session2?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session: session2 } }) => {
      setSession(session2);
      setUser(session2?.user ?? null);
      setLoading(false);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  const signUp = async (email, password, collegeId) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data?.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        role: "buyer",
        college_id: collegeId ?? null
      });
    }
    return { data, error };
  };
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };
  return /* @__PURE__ */ jsxDEV(AuthContext.Provider, { value: { user, session, loading, signUp, signIn, signOut }, children }, void 0, false, {
    fileName: "C:/Users/ashwi/OneDrive/Desktop/CampusMart/src/context/AuthContext.tsx",
    lineNumber: 82,
    columnNumber: 5
  }, this);
};
_s(AuthProvider, "sIDOCMze9iVqwxkgWIhOu8vskSI=");
_c = AuthProvider;
export const useAuth = () => {
  _s2();
  const context = useContext(AuthContext);
  if (context === void 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
_s2(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
$RefreshReg$(_c, "AuthProvider");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("C:/Users/ashwi/OneDrive/Desktop/CampusMart/src/context/AuthContext.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/Users/ashwi/OneDrive/Desktop/CampusMart/src/context/AuthContext.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBOERJOzs7Ozs7Ozs7Ozs7Ozs7OztBQTdESixPQUFPQSxTQUFTQyxlQUFlQyxZQUFZQyxXQUFXQyxVQUFVQyxpQkFBaUI7QUFDakYsU0FBU0MsZ0JBQWdCO0FBWXpCLE1BQU1DLGNBQWNOLGNBQTRDTyxNQUFTO0FBRWxFLGFBQU1DLGVBQWVBLENBQUMsRUFBRUMsU0FBa0MsTUFBTTtBQUFBQyxLQUFBO0FBQ3JFLFFBQU0sQ0FBQ0MsTUFBTUMsT0FBTyxJQUFJVCxTQUFjLElBQUk7QUFDMUMsUUFBTSxDQUFDVSxTQUFTQyxVQUFVLElBQUlYLFNBQWMsSUFBSTtBQUNoRCxRQUFNLENBQUNZLFNBQVNDLFVBQVUsSUFBSWIsU0FBUyxJQUFJO0FBRTNDRCxZQUFVLE1BQU07QUFDZCxVQUFNLEVBQUVlLE1BQU1DLGFBQWEsSUFBSWIsU0FBU2MsS0FBS0Msa0JBQWtCLENBQUNDLFFBQVFSLGFBQVk7QUFDbEZDLGlCQUFXRCxRQUFPO0FBQ2xCRCxjQUFRQyxVQUFTRixRQUFRLElBQUk7QUFDN0JLLGlCQUFXLEtBQUs7QUFBQSxJQUNsQixDQUFDO0FBRURYLGFBQVNjLEtBQUtHLFdBQVcsRUFBRUMsS0FBSyxDQUFDLEVBQUVOLE1BQU0sRUFBRUosa0JBQVEsRUFBRSxNQUFNO0FBQ3pEQyxpQkFBV0QsUUFBTztBQUNsQkQsY0FBUUMsVUFBU0YsUUFBUSxJQUFJO0FBQzdCSyxpQkFBVyxLQUFLO0FBQUEsSUFDbEIsQ0FBQztBQUNELFdBQU8sTUFBTTtBQUNYRSxtQkFBYU0sYUFBYUMsWUFBWTtBQUFBLElBQ3hDO0FBQUEsRUFDRixHQUFHLEVBQUU7QUFFTCxRQUFNQyxTQUFTLE9BQU9DLE9BQWVDLFVBQWtCQyxjQUF1QjtBQUM1RSxVQUFNLEVBQUVaLE1BQU1hLE1BQU0sSUFBSSxNQUFNekIsU0FBU2MsS0FBS08sT0FBTyxFQUFFQyxPQUFPQyxTQUFTLENBQUM7QUFDdEUsUUFBSSxDQUFDRSxTQUFTYixNQUFNTixNQUFNO0FBRXhCLFlBQU1OLFNBQVMwQixLQUFLLFVBQVUsRUFBRUMsT0FBTztBQUFBLFFBQ3JDQyxJQUFJaEIsS0FBS04sS0FBS3NCO0FBQUFBLFFBQ2RDLE1BQU07QUFBQSxRQUNOQyxZQUFZTixhQUFhO0FBQUEsTUFDM0IsQ0FBQztBQUFBLElBQ0g7QUFDQSxXQUFPLEVBQUVaLE1BQU1hLE1BQU07QUFBQSxFQUN2QjtBQUVBLFFBQU1NLFNBQVMsT0FBT1QsT0FBZUMsYUFBcUI7QUFDeEQsVUFBTSxFQUFFWCxNQUFNYSxNQUFNLElBQUksTUFBTXpCLFNBQVNjLEtBQUtrQixtQkFBbUIsRUFBRVYsT0FBT0MsU0FBUyxDQUFDO0FBQ2xGLFdBQU8sRUFBRVgsTUFBTWEsTUFBTTtBQUFBLEVBQ3ZCO0FBRUEsUUFBTVEsVUFBVSxZQUFZO0FBQzFCLFVBQU0sRUFBRVIsTUFBTSxJQUFJLE1BQU16QixTQUFTYyxLQUFLbUIsUUFBUTtBQUM5QyxXQUFPLEVBQUVSLE1BQU07QUFBQSxFQUNqQjtBQUVBLFNBQ0UsdUJBQUMsWUFBWSxVQUFaLEVBQXFCLE9BQU8sRUFBRW5CLE1BQU1FLFNBQVNFLFNBQVNXLFFBQVFVLFFBQVFFLFFBQVEsR0FDNUU3QixZQURIO0FBQUE7QUFBQTtBQUFBO0FBQUEsU0FFQTtBQUVKO0FBQUVDLEdBbERXRixjQUFZO0FBQUEsS0FBWkE7QUFvRE4sYUFBTStCLFVBQVVBLE1BQU07QUFBQUMsTUFBQTtBQUMzQixRQUFNQyxVQUFVeEMsV0FBV0ssV0FBVztBQUN0QyxNQUFJbUMsWUFBWWxDLFFBQVc7QUFDekIsVUFBTSxJQUFJbUMsTUFBTSw2Q0FBNkM7QUFBQSxFQUMvRDtBQUNBLFNBQU9EO0FBQ1Q7QUFBRUQsSUFOV0QsU0FBTztBQUFBLElBQUFJO0FBQUEsYUFBQUEsSUFBQSIsIm5hbWVzIjpbIlJlYWN0IiwiY3JlYXRlQ29udGV4dCIsInVzZUNvbnRleHQiLCJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsIlJlYWN0Tm9kZSIsInN1cGFiYXNlIiwiQXV0aENvbnRleHQiLCJ1bmRlZmluZWQiLCJBdXRoUHJvdmlkZXIiLCJjaGlsZHJlbiIsIl9zIiwidXNlciIsInNldFVzZXIiLCJzZXNzaW9uIiwic2V0U2Vzc2lvbiIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwiZGF0YSIsImF1dGhMaXN0ZW5lciIsImF1dGgiLCJvbkF1dGhTdGF0ZUNoYW5nZSIsIl9ldmVudCIsImdldFNlc3Npb24iLCJ0aGVuIiwic3Vic2NyaXB0aW9uIiwidW5zdWJzY3JpYmUiLCJzaWduVXAiLCJlbWFpbCIsInBhc3N3b3JkIiwiY29sbGVnZUlkIiwiZXJyb3IiLCJmcm9tIiwidXBzZXJ0IiwiaWQiLCJyb2xlIiwiY29sbGVnZV9pZCIsInNpZ25JbiIsInNpZ25JbldpdGhQYXNzd29yZCIsInNpZ25PdXQiLCJ1c2VBdXRoIiwiX3MyIiwiY29udGV4dCIsIkVycm9yIiwiX2MiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsiQXV0aENvbnRleHQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8vIHNyYy9jb250ZXh0L0F1dGhDb250ZXh0LnRzeFxuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZUNvbnRleHQsIHVzZUNvbnRleHQsIHVzZUVmZmVjdCwgdXNlU3RhdGUsIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IHN1cGFiYXNlIH0gZnJvbSAnLi4vbGliL3N1cGFiYXNlJztcbi8vIFR5cGVzIGFyZSBpbmZlcnJlZDsgdXNpbmcgZ2VuZXJpYyBhbnkgZm9yIGNvbXBhdGliaWxpdHlcblxuaW50ZXJmYWNlIEF1dGhDb250ZXh0UHJvcHMge1xuICB1c2VyOiBhbnk7IC8vIFN1cGFiYXNlIFVzZXJcbiAgc2Vzc2lvbjogYW55OyAvLyBTdXBhYmFzZSBTZXNzaW9uXG4gIGxvYWRpbmc6IGJvb2xlYW47XG4gIHNpZ25VcDogKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIGNvbGxlZ2VJZD86IHN0cmluZykgPT4gUHJvbWlzZTx7IGVycm9yOiBhbnk7IGRhdGE6IGFueSB9PjtcbiAgc2lnbkluOiAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykgPT4gUHJvbWlzZTx7IGVycm9yOiBhbnk7IGRhdGE6IGFueSB9PjtcbiAgc2lnbk91dDogKCkgPT4gUHJvbWlzZTx7IGVycm9yOiBhbnkgfT5cbn1cblxuY29uc3QgQXV0aENvbnRleHQgPSBjcmVhdGVDb250ZXh0PEF1dGhDb250ZXh0UHJvcHMgfCB1bmRlZmluZWQ+KHVuZGVmaW5lZCk7XG5cbmV4cG9ydCBjb25zdCBBdXRoUHJvdmlkZXIgPSAoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdE5vZGUgfSkgPT4ge1xuICBjb25zdCBbdXNlciwgc2V0VXNlcl0gPSB1c2VTdGF0ZTxhbnk+KG51bGwpO1xuICBjb25zdCBbc2Vzc2lvbiwgc2V0U2Vzc2lvbl0gPSB1c2VTdGF0ZTxhbnk+KG51bGwpO1xuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHsgZGF0YTogYXV0aExpc3RlbmVyIH0gPSBzdXBhYmFzZS5hdXRoLm9uQXV0aFN0YXRlQ2hhbmdlKChfZXZlbnQsIHNlc3Npb24pID0+IHtcbiAgICAgIHNldFNlc3Npb24oc2Vzc2lvbik7XG4gICAgICBzZXRVc2VyKHNlc3Npb24/LnVzZXIgPz8gbnVsbCk7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICB9KTtcbiAgICAvLyBHZXQgaW5pdGlhbCBzZXNzaW9uXG4gICAgc3VwYWJhc2UuYXV0aC5nZXRTZXNzaW9uKCkudGhlbigoeyBkYXRhOiB7IHNlc3Npb24gfSB9KSA9PiB7XG4gICAgICBzZXRTZXNzaW9uKHNlc3Npb24pO1xuICAgICAgc2V0VXNlcihzZXNzaW9uPy51c2VyID8/IG51bGwpO1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGF1dGhMaXN0ZW5lci5zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9O1xuICB9LCBbXSk7XG5cbiAgY29uc3Qgc2lnblVwID0gYXN5bmMgKGVtYWlsOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIGNvbGxlZ2VJZD86IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguc2lnblVwKHsgZW1haWwsIHBhc3N3b3JkIH0pO1xuICAgIGlmICghZXJyb3IgJiYgZGF0YT8udXNlcikge1xuICAgICAgLy8gSW5zZXJ0IHByb2ZpbGUgcm93IHdpdGggZGVmYXVsdCByb2xlICdidXllcidcbiAgICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oJ3Byb2ZpbGVzJykudXBzZXJ0KHtcbiAgICAgICAgaWQ6IGRhdGEudXNlci5pZCxcbiAgICAgICAgcm9sZTogJ2J1eWVyJyxcbiAgICAgICAgY29sbGVnZV9pZDogY29sbGVnZUlkID8/IG51bGwsXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHsgZGF0YSwgZXJyb3IgfTtcbiAgfTtcblxuICBjb25zdCBzaWduSW4gPSBhc3luYyAoZW1haWw6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguc2lnbkluV2l0aFBhc3N3b3JkKHsgZW1haWwsIHBhc3N3b3JkIH0pO1xuICAgIHJldHVybiB7IGRhdGEsIGVycm9yIH07XG4gIH07XG5cbiAgY29uc3Qgc2lnbk91dCA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25PdXQoKTtcbiAgICByZXR1cm4geyBlcnJvciB9O1xuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPEF1dGhDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt7IHVzZXIsIHNlc3Npb24sIGxvYWRpbmcsIHNpZ25VcCwgc2lnbkluLCBzaWduT3V0IH19PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvQXV0aENvbnRleHQuUHJvdmlkZXI+XG4gICk7XG59O1xuXG5leHBvcnQgY29uc3QgdXNlQXV0aCA9ICgpID0+IHtcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoQXV0aENvbnRleHQpO1xuICBpZiAoY29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VBdXRoIG11c3QgYmUgdXNlZCB3aXRoaW4gYW4gQXV0aFByb3ZpZGVyJyk7XG4gIH1cbiAgcmV0dXJuIGNvbnRleHQ7XG59O1xuIl0sImZpbGUiOiJDOi9Vc2Vycy9hc2h3aS9PbmVEcml2ZS9EZXNrdG9wL0NhbXB1c01hcnQvc3JjL2NvbnRleHQvQXV0aENvbnRleHQudHN4In0=