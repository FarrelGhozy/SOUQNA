import 'package:dio/dio.dart';

// Mock-first: Dio terpasang, tapi USE_MOCK=true → kembalikan dummy lokal.
// Saat backend siap: flip ke false + set baseUrl ke /api/v1.
const useMock = true;

class ApiClient {
  final Dio dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000/api/v1'));
  Future<List<String>> getProducts({String? q}) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return ['prod-01 Ayam Geprek', 'prod-04 Hijab Voal', 'prod-07 Print A4'];
  }
}
